import { constantTimeEqual, jsonResponse, sanitizeText } from '../../lib/security';
import { Env, PagesFunction } from '../../lib/types';

function verifyAdminAuth(request: Request, env: Env): Response | null {
  const token = env.ADMIN_ACCESS_TOKEN?.trim() || '';
  if (!token || token.includes('replace_with')) {
    return jsonResponse(
      {
        success: false,
        configured: false,
        error: 'ADMIN_ACCESS_TOKEN is not configured in server environment secrets.',
      },
      503
    );
  }

  const authHeader = request.headers.get('Authorization') || '';
  const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!provided || !constantTimeEqual(provided, token)) {
    return jsonResponse({ success: false, error: 'Invalid or missing admin authorization token.' }, 401);
  }

  return null;
}

export const onRequestGet: PagesFunction = async ({ request, env }) => {
  const authError = verifyAdminAuth(request, env);
  if (authError) return authError;

  if (!env.DB) {
    return jsonResponse({ success: false, error: 'Database binding (DB) is not configured.' }, 503);
  }

  const url = new URL(request.url);
  const serviceFilter = sanitizeText(url.searchParams.get('service'), 100);
  const search = sanitizeText(url.searchParams.get('q'), 100);

  let query = `
    SELECT
      e.id, e.reference_number, e.full_name, e.business_name, e.email, e.phone,
      e.category, e.service, e.services_json, e.package, e.budget, e.description,
      e.additional_requirements, e.contact_preference, e.status, e.created_at,
      (SELECT p.status FROM payments p WHERE p.enquiry_id = e.id ORDER BY p.id DESC LIMIT 1) AS payment_status,
      (SELECT p.razorpay_order_id FROM payments p WHERE p.enquiry_id = e.id ORDER BY p.id DESC LIMIT 1) AS razorpay_order_id
    FROM enquiries e
    WHERE 1=1
  `;

  const bindings: unknown[] = [];
  if (serviceFilter && serviceFilter !== 'All') {
    query += ' AND e.service LIKE ?';
    bindings.push(`%${serviceFilter}%`);
  }
  if (search) {
    const like = `%${search}%`;
    query += ' AND (e.full_name LIKE ? OR e.business_name LIKE ? OR e.reference_number LIKE ? OR e.email LIKE ?)';
    bindings.push(like, like, like, like);
  }

  query += ' ORDER BY e.id DESC LIMIT 150';

  const result = await env.DB.prepare(query).bind(...bindings).all();

  return jsonResponse({
    success: true,
    enquiries: result.results,
  });
};

export const onRequestPatch: PagesFunction = async ({ request, env }) => {
  const authError = verifyAdminAuth(request, env);
  if (authError) return authError;

  if (!env.DB) {
    return jsonResponse({ success: false, error: 'Database binding (DB) is not configured.' }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON payload.' }, 400);
  }

  const id = Number(body.id);
  const status = sanitizeText(body.status, 30);
  const allowedStatuses = ['New', 'Contacted', 'In Progress', 'Completed', 'Quoted', 'Paid', 'Archived'];

  if (!Number.isInteger(id) || id <= 0 || !allowedStatuses.includes(status)) {
    return jsonResponse({ success: false, error: 'Invalid enquiry ID or status value.' }, 400);
  }

  await env.DB.prepare('UPDATE enquiries SET status = ? WHERE id = ?').bind(status, id).run();

  return jsonResponse({ success: true, id, status });
};
