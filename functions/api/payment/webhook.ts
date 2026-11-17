import { constantTimeEqual, hmacSha256Hex, jsonResponse } from '../../lib/security';
import { PagesFunction } from '../../lib/types';

interface RazorpayWebhookPayload {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
      };
    };
    refund?: {
      entity?: {
        payment_id?: string;
      };
    };
  };
}

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  if (!env.DB) {
    return jsonResponse({ success: false, error: 'Database binding (DB) is not configured.' }, 503);
  }

  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET?.trim() || '';
  if (!webhookSecret || webhookSecret.includes('replace_with')) {
    return jsonResponse(
      { success: false, error: 'RAZORPAY_WEBHOOK_SECRET is not configured on the server.' },
      503
    );
  }

  const signature = (request.headers.get('x-razorpay-signature') || '').trim().toLowerCase();
  const eventIdHeader = (request.headers.get('x-razorpay-event-id') || '').trim();
  if (!signature) {
    return jsonResponse({ success: false, error: 'Missing x-razorpay-signature header.' }, 400);
  }

  const rawBody = await request.text();
  const expectedSignature = (await hmacSha256Hex(webhookSecret, rawBody)).toLowerCase();

  if (!constantTimeEqual(expectedSignature, signature)) {
    return jsonResponse({ success: false, error: 'Invalid webhook signature.' }, 400);
  }

  let parsed: RazorpayWebhookPayload;
  try {
    parsed = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return jsonResponse({ success: false, error: 'Invalid webhook JSON.' }, 400);
  }

  const eventType = parsed.event || 'unknown';
  const paymentEntity = parsed.payload?.payment?.entity;
  const fallbackEventKey = `${eventType}:${paymentEntity?.order_id || paymentEntity?.id || rawBody.length}`;
  const eventId = eventIdHeader || fallbackEventKey;

  const alreadyProcessed = await env.DB.prepare(
    'SELECT id FROM webhook_events WHERE event_id = ? LIMIT 1'
  )
    .bind(eventId)
    .first<{ id: number }>();

  if (alreadyProcessed) {
    return jsonResponse({ success: true, received: true, duplicate: true });
  }

  await env.DB.prepare('INSERT INTO webhook_events (event_id, event_type) VALUES (?, ?)')
    .bind(eventId, eventType)
    .run();

  if (eventType === 'payment.authorized' && paymentEntity?.order_id && paymentEntity?.id) {
    await env.DB.prepare(
      `UPDATE payments
       SET razorpay_payment_id = COALESCE(razorpay_payment_id, ?),
           status = CASE WHEN status = 'CAPTURED' THEN 'CAPTURED' ELSE 'AUTHORIZED' END,
           updated_at = datetime('now')
       WHERE razorpay_order_id = ?`
    )
      .bind(paymentEntity.id, paymentEntity.order_id)
      .run();
  } else if (eventType === 'payment.captured' && paymentEntity?.order_id && paymentEntity?.id) {
    await env.DB.prepare(
      `UPDATE payments
       SET razorpay_payment_id = ?, status = 'CAPTURED', verification_status = 'VERIFIED',
           transaction_timestamp = datetime('now'), updated_at = datetime('now')
       WHERE razorpay_order_id = ?`
    )
      .bind(paymentEntity.id, paymentEntity.order_id)
      .run();

    await env.DB.prepare(
      `UPDATE enquiries
       SET status = 'Paid'
       WHERE id IN (SELECT enquiry_id FROM payments WHERE razorpay_order_id = ?)`
    )
      .bind(paymentEntity.order_id)
      .run();
  } else if (eventType === 'payment.failed' && paymentEntity?.order_id) {
    await env.DB.prepare(
      `UPDATE payments
       SET status = 'FAILED', verification_status = 'FAILED', updated_at = datetime('now')
       WHERE razorpay_order_id = ? AND status != 'CAPTURED'`
    )
      .bind(paymentEntity.order_id)
      .run();
  } else if (
    (eventType === 'refund.created' || eventType === 'payment.refunded') &&
    (parsed.payload?.refund?.entity?.payment_id || paymentEntity?.id)
  ) {
    const payId = parsed.payload?.refund?.entity?.payment_id || paymentEntity?.id;
    await env.DB.prepare(
      `UPDATE payments
       SET status = 'REFUNDED', updated_at = datetime('now')
       WHERE razorpay_payment_id = ?`
    )
      .bind(payId)
      .run();
  }

  return jsonResponse({ success: true, received: true, eventType });
};
