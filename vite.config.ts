import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

interface DevEnquiryRow {
  id: number;
  reference_number: string;
  full_name: string;
  business_name: string;
  email: string;
  phone: string;
  category: string;
  service: string;
  services_json: string;
  package: string;
  budget: string;
  description: string;
  additional_requirements: string;
  contact_preference: string;
  status: string;
  created_at: string;
}

interface DevPaymentRow {
  id: number;
  enquiry_id: number | null;
  enquiry_reference: string;
  customer_name: string;
  customer_email: string;
  service_name: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  verification_status: string;
  transaction_timestamp: string;
  created_at: string;
  updated_at: string;
}

function createDevD1Database() {
  const enquiries: DevEnquiryRow[] = [];
  const payments: DevPaymentRow[] = [];
  const webhookEvents: { id: number; event_id: string; event_type: string; processed_at: string }[] = [];
  const rateLimits = new Map<string, { window_start: number; request_count: number }>();

  const makeStatement = (query: string, bound: unknown[] = []) => {
    const q = query.replace(/\s+/g, ' ').trim();
    return {
      bind(...values: unknown[]) {
        return makeStatement(query, values);
      },
      async first<T = Record<string, unknown>>() {
        if (q.startsWith('SELECT window_start, request_count FROM rate_limits')) {
          const key = `${bound[0]}:${bound[1]}`;
          return (rateLimits.get(key) as unknown as T) || null;
        }
        if (q.includes('FROM enquiries') && q.includes('datetime(created_at)')) {
          const [email, service, description] = bound as [string, string, string];
          const cutoff = Date.now() - 120_000;
          const match = enquiries.find(
            (e) =>
              e.email === email &&
              e.service === service &&
              e.description === description &&
              new Date(e.created_at).getTime() >= cutoff
          );
          return (match ? { reference_number: match.reference_number } : null) as unknown as T;
        }
        if (q.includes('FROM enquiries WHERE reference_number = ?')) {
          const ref = String(bound[0]);
          const match = enquiries.find((e) => e.reference_number === ref);
          return (match || null) as unknown as T;
        }
        if (q.includes('FROM payments') && q.includes('WHERE p.razorpay_order_id = ?')) {
          const orderId = String(bound[0]);
          const p = payments.find((item) => item.razorpay_order_id === orderId);
          return (p || null) as unknown as T;
        }
        if (q.includes('FROM payments WHERE razorpay_order_id = ?')) {
          const orderId = String(bound[0]);
          const p = payments.find((item) => item.razorpay_order_id === orderId);
          return (p || null) as unknown as T;
        }
        if (q.includes('FROM payments') && q.includes("status = 'CAPTURED'")) {
          const ref = String(bound[0]);
          const p = payments.find(
            (item) =>
              item.enquiry_reference === ref &&
              item.status === 'CAPTURED' &&
              item.verification_status === 'VERIFIED'
          );
          return (p || null) as unknown as T;
        }
        if (q.includes('FROM payments WHERE enquiry_reference = ?')) {
          const ref = String(bound[0]);
          const p = [...payments].reverse().find((item) => item.enquiry_reference === ref);
          return (p || null) as unknown as T;
        }
        if (q.startsWith('SELECT id FROM webhook_events WHERE event_id = ?')) {
          const eventId = String(bound[0]);
          const found = webhookEvents.find((w) => w.event_id === eventId);
          return (found ? { id: found.id } : null) as unknown as T;
        }
        return null;
      },
      async run() {
        if (q.startsWith('INSERT INTO rate_limits')) {
          const key = `${bound[0]}:${bound[1]}`;
          rateLimits.set(key, { window_start: Number(bound[2]), request_count: 1 });
          return { success: true, meta: { changes: 1 } };
        }
        if (q.startsWith('UPDATE rate_limits SET request_count')) {
          const key = `${bound[0]}:${bound[1]}`;
          const cur = rateLimits.get(key);
          if (cur) cur.request_count += 1;
          return { success: true, meta: { changes: 1 } };
        }
        if (q.startsWith('INSERT INTO enquiries')) {
          const id = enquiries.length + 1;
          enquiries.push({
            id,
            reference_number: String(bound[0]),
            full_name: String(bound[1]),
            business_name: String(bound[2]),
            email: String(bound[3]),
            phone: String(bound[4]),
            category: String(bound[5]),
            service: String(bound[6]),
            services_json: String(bound[7]),
            package: String(bound[8]),
            budget: String(bound[9]),
            description: String(bound[10]),
            additional_requirements: String(bound[11]),
            contact_preference: String(bound[12]),
            status: 'New',
            created_at: new Date().toISOString(),
          });
          return { success: true, meta: { last_row_id: id, changes: 1 } };
        }
        if (q.startsWith('INSERT INTO payments')) {
          const id = payments.length + 1;
          const now = new Date().toISOString();
          payments.push({
            id,
            enquiry_id: bound[0] ? Number(bound[0]) : null,
            enquiry_reference: String(bound[1]),
            customer_name: String(bound[2]),
            customer_email: String(bound[3]),
            service_name: String(bound[4]),
            razorpay_order_id: String(bound[5]),
            razorpay_payment_id: null,
            amount: Number(bound[6]),
            currency: 'INR',
            status: 'CREATED',
            verification_status: 'UNVERIFIED',
            transaction_timestamp: now,
            created_at: now,
            updated_at: now,
          });
          return { success: true, meta: { last_row_id: id, changes: 1 } };
        }
        if (q.includes("SET status = 'FAILED', verification_status = 'FAILED'")) {
          const p = payments.find((item) => item.id === Number(bound[0]));
          if (p) {
            p.status = 'FAILED';
            p.verification_status = 'FAILED';
            p.updated_at = new Date().toISOString();
          }
          return { success: true, meta: { changes: p ? 1 : 0 } };
        }
        if (q.includes('SET razorpay_payment_id = ?, status = ?, verification_status = ?')) {
          const p = payments.find((item) => item.id === Number(bound[3]));
          if (p) {
            p.razorpay_payment_id = String(bound[0]);
            p.status = String(bound[1]);
            p.verification_status = String(bound[2]);
            p.updated_at = new Date().toISOString();
          }
          return { success: true, meta: { changes: p ? 1 : 0 } };
        }
        if (q.startsWith("UPDATE enquiries SET status = 'Paid' WHERE id = ?")) {
          const e = enquiries.find((item) => item.id === Number(bound[0]));
          if (e) e.status = 'Paid';
          return { success: true, meta: { changes: 1 } };
        }
        if (q.startsWith('UPDATE enquiries SET status = ? WHERE id = ?')) {
          const e = enquiries.find((item) => item.id === Number(bound[1]));
          if (e) e.status = String(bound[0]);
          return { success: true, meta: { changes: e ? 1 : 0 } };
        }
        if (q.startsWith('INSERT INTO webhook_events')) {
          webhookEvents.push({
            id: webhookEvents.length + 1,
            event_id: String(bound[0]),
            event_type: String(bound[1]),
            processed_at: new Date().toISOString(),
          });
          return { success: true, meta: { changes: 1 } };
        }
        return { success: true, meta: { changes: 0 } };
      },
      async all<T = Record<string, unknown>>() {
        if (q.includes('FROM payments')) {
          return { results: [...payments].reverse() as unknown as T[], success: true };
        }
        const rows = [...enquiries].reverse().map((e) => {
          const latestPayment = [...payments].reverse().find((p) => p.enquiry_id === e.id);
          return {
            ...e,
            payment_status: latestPayment?.status || null,
            razorpay_order_id: latestPayment?.razorpay_order_id || null,
          };
        });
        return { results: rows as unknown as T[], success: true };
      },
    };
  };

  return {
    prepare(query: string) {
      return makeStatement(query);
    },
    async batch(statements: ReturnType<typeof makeStatement>[]) {
      const results = [];
      for (const stmt of statements) {
        results.push(await stmt.run());
      }
      return results;
    },
  };
}

function cloudflareFunctionsDevBridge(): Plugin {
  const devDb = createDevD1Database();
  const routeMap: Record<string, string> = {
    '/api/config': '/functions/api/config.ts',
    '/api/enquiries': '/functions/api/enquiries.ts',
    '/api/contact': '/functions/api/contact.ts',
    '/api/email/test': '/functions/api/email/test.ts',
    '/api/create-order': '/functions/api/create-order.ts',
    '/api/verify-payment': '/functions/api/verify-payment.ts',
    '/api/payment/create-order': '/functions/api/payment/create-order.ts',
    '/api/payment/verify': '/functions/api/payment/verify.ts',
    '/api/payment/webhook': '/functions/api/payment/webhook.ts',
    '/api/payment/status': '/functions/api/payment/status.ts',
    '/api/admin/enquiries': '/functions/api/admin/enquiries.ts',
    '/api/admin/payments': '/functions/api/admin/payments.ts',
  };

  return {
    name: 'cloudflare-pages-functions-dev-bridge',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const reqPath = (req.url || '').split('?')[0];
        const modulePath = routeMap[reqPath];
        if (!modulePath) {
          return next();
        }

        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }
          const rawBody = Buffer.concat(chunks);
          const origin = `http://${req.headers.host || 'localhost:3000'}`;
          const webReq = new Request(`${origin}${req.url}`, {
            method: req.method || 'GET',
            headers: req.headers as Record<string, string>,
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : rawBody,
          });

          const mwMod = await server.ssrLoadModule('/functions/_middleware.ts');
          const mod = await server.ssrLoadModule(modulePath);
          const method = (req.method || 'GET').toUpperCase();
          const handler =
            mod[`onRequest${method[0]}${method.slice(1).toLowerCase()}`] || mod.onRequest;

          const env = {
            ...process.env,
            DB: devDb,
            CONTACT_EMAIL: process.env.CONTACT_EMAIL || process.env.BUSINESS_EMAIL || 'educationrevolution90@gmail.com',
            WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER || '917319785754',
          };

          const runRoute = async () => {
            if (typeof handler !== 'function') {
              return new Response(
                JSON.stringify({ success: false, error: `Method ${method} not allowed.` }),
                { status: 405, headers: { 'Content-Type': 'application/json' } }
              );
            }
            return handler({
              request: webReq,
              env,
              params: {},
              next: async () => new Response('Not found', { status: 404 }),
              waitUntil: () => {},
            });
          };

          const webRes: Response =
            typeof mwMod.onRequest === 'function'
              ? await mwMod.onRequest({
                  request: webReq,
                  env,
                  params: {},
                  next: runRoute,
                  waitUntil: () => {},
                })
              : await runRoute();

          res.statusCode = webRes.status;
          webRes.headers.forEach((value, key) => {
            res.setHeader(key, value);
          });
          const buf = Buffer.from(await webRes.arrayBuffer());
          res.end(buf);
        } catch (err) {
          console.error('Dev API bridge error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Internal dev bridge error.' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      cloudflareFunctionsDevBridge(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build' as const,
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(import.meta.dirname, 'dist');
          const srcAssets = path.resolve(import.meta.dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'react';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'icons';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
