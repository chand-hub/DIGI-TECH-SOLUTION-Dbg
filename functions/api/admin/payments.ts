import { constantTimeEqual, jsonResponse } from '../../lib/security';
import { Env, PagesFunction } from '../../lib/types';

export const onRequestGet: PagesFunction = async ({ request, env }) => {
  const token = env.ADMIN_ACCESS_TOKEN?.trim() || '';
  if (!token || token.includes('replace_with')) {
    return jsonResponse(
      { success: false, configured: false, error: 'ADMIN_ACCESS_TOKEN is not configured.' },
      503
    );
  }

  const authHeader = request.headers.get('Authorization') || '';
  const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!provided || !constantTimeEqual(provided, token)) {
    return jsonResponse({ success: false, error: 'Unauthorized.' }, 401);
  }

  if (!env.DB) {
    return jsonResponse({ success: false, error: 'Database binding (DB) is not configured.' }, 503);
  }

  const result = await env.DB.prepare(
    `SELECT id, enquiry_id, enquiry_reference, customer_name, customer_email, service_name,
            razorpay_order_id, razorpay_payment_id, amount, currency, status,
            verification_status, transaction_timestamp, created_at, updated_at
     FROM payments
     ORDER BY id DESC LIMIT 150`
  ).all();

  return jsonResponse({
    success: true,
    payments: result.results,
  });
};
