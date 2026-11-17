import { ALLOWED_PACKAGES, ALLOWED_SERVICES, D1Database, Env } from './types';

export function jsonResponse(
  data: Record<string, unknown>,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

export function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function stripHeaderNewlines(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 160) return false;
  if (/[\r\n]/.test(email)) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export function normalizeIndianPhone(raw: string): string | null {
  const digits = raw.replace(/[\s\-()+]/g, '');
  let core = digits;
  if (core.startsWith('91') && core.length === 12) {
    core = core.slice(2);
  } else if (core.startsWith('0') && core.length === 11) {
    core = core.slice(1);
  }
  if (!/^[6-9]\d{9}$/.test(core)) {
    return null;
  }
  return `+91${core}`;
}

export interface ValidatedEnquiry {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  category: string;
  services: string[];
  serviceSummary: string;
  selectedPackage: string;
  budget: string;
  description: string;
  additionalRequirements: string;
  contactPreference: 'WhatsApp' | 'Phone Call' | 'Email';
}

export function validateEnquiryPayload(
  body: Record<string, unknown>
): { ok: true; data: ValidatedEnquiry } | { ok: false; error: string; fieldErrors?: Record<string, string> } {
  // Honeypot spam trap
  const honeypot = sanitizeText(body.website_url ?? body.honeypot ?? '', 200);
  if (honeypot.length > 0) {
    return { ok: false, error: 'Spam protection triggered.' };
  }

  const fieldErrors: Record<string, string> = {};

  const fullName = sanitizeText(body.fullName, 120);
  if (fullName.length < 2) {
    fieldErrors.fullName = 'Please enter your full name (minimum 2 characters).';
  }

  const businessName = sanitizeText(body.businessName, 150);

  const email = stripHeaderNewlines(sanitizeText(body.email, 160)).toLowerCase();
  if (!isValidEmail(email)) {
    fieldErrors.email = 'Please enter a valid email address.';
  }

  const rawPhone = sanitizeText(body.phone, 24);
  const normalizedPhone = normalizeIndianPhone(rawPhone);
  if (!normalizedPhone) {
    fieldErrors.phone = 'Please enter a valid 10-digit Indian WhatsApp / mobile number.';
  }

  const category = sanitizeText(body.category, 80) || 'General Business';

  // Multi-select services support (accepts `services` array or single `service` string)
  const rawServices: string[] = [];
  if (Array.isArray(body.services)) {
    for (const s of body.services) {
      const cleaned = sanitizeText(s, 100);
      if (cleaned) rawServices.push(cleaned);
    }
  } else if (typeof body.service === 'string') {
    const cleaned = sanitizeText(body.service, 100);
    if (cleaned) rawServices.push(cleaned);
  }

  const uniqueServices = Array.from(new Set(rawServices)).filter((s) =>
    (ALLOWED_SERVICES as readonly string[]).includes(s)
  );

  if (uniqueServices.length === 0) {
    fieldErrors.services = 'Please select at least one required service.';
  }

  const rawPackage = sanitizeText(body.selectedPackage, 80);
  const selectedPackage = (ALLOWED_PACKAGES as readonly string[]).includes(rawPackage)
    ? rawPackage
    : 'Custom Quote';

  // Optional fields: zero minimum-character restriction!
  const budget = sanitizeText(body.budget, 80);
  const description = sanitizeText(body.description, 5000);
  const additionalRequirements = sanitizeText(body.additionalRequirements, 3000);

  const prefRaw = sanitizeText(body.contactPreference, 30);
  const contactPreference: 'WhatsApp' | 'Phone Call' | 'Email' =
    prefRaw === 'Phone Call' || prefRaw === 'Email' ? prefRaw : 'WhatsApp';

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: Object.values(fieldErrors)[0],
      fieldErrors,
    };
  }

  return {
    ok: true,
    data: {
      fullName,
      businessName,
      email,
      phone: normalizedPhone!,
      category,
      services: uniqueServices,
      serviceSummary: uniqueServices.join(', '),
      selectedPackage,
      budget,
      description,
      additionalRequirements,
      contactPreference,
    },
  };
}

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  );
}

export async function checkRateLimit(
  db: D1Database | undefined,
  request: Request,
  endpoint: string,
  maxRequests = 10,
  windowSeconds = 600
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  if (!db) {
    return { allowed: true };
  }

  try {
    const ipHash = await sha256Hex(`${getClientIp(request)}:${endpoint}`);
    const nowSec = Math.floor(Date.now() / 1000);
    const existing = await db
      .prepare('SELECT window_start, request_count FROM rate_limits WHERE ip_hash = ? AND endpoint = ?')
      .bind(ipHash, endpoint)
      .first<{ window_start: number; request_count: number }>();

    if (!existing || nowSec - existing.window_start >= windowSeconds) {
      await db
        .prepare(
          `INSERT INTO rate_limits (ip_hash, endpoint, window_start, request_count)
           VALUES (?, ?, ?, 1)
           ON CONFLICT(ip_hash, endpoint) DO UPDATE SET window_start = excluded.window_start, request_count = 1`
        )
        .bind(ipHash, endpoint, nowSec)
        .run();
      return { allowed: true };
    }

    if (existing.request_count >= maxRequests) {
      const retryAfterSeconds = Math.max(1, windowSeconds - (nowSec - existing.window_start));
      return { allowed: false, retryAfterSeconds };
    }

    await db
      .prepare('UPDATE rate_limits SET request_count = request_count + 1 WHERE ip_hash = ? AND endpoint = ?')
      .bind(ipHash, endpoint)
      .run();

    return { allowed: true };
  } catch (err) {
    console.error('Rate limit check error:', err);
    return { allowed: true };
  }
}

export function generateReferenceNumber(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  return `DTS-${y}${m}${d}-${suffix}`;
}

export function getCorsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = env.APP_BASE_URL?.replace(/\/$/, '') || '';

  const isLocal =
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:');

  const isSameOrigin = (() => {
    try {
      const reqUrl = new URL(request.url);
      return origin === reqUrl.origin;
    } catch {
      return false;
    }
  })();

  const allow =
    isSameOrigin ||
    isLocal ||
    (allowedOrigin.length > 0 && origin === allowedOrigin);

  if (!origin || !allow) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}
