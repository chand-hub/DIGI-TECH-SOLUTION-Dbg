import { constantTimeEqual, hmacSha256Hex, jsonResponse, sanitizeText } from '../../lib/security';
import { PagesFunction, PaymentState, VerificationState } from '../../lib/types';

function mapRazorpayStatus(rawStatus: string | undefined): PaymentState {
  switch ((rawStatus || '').toLowerCase()) {
    case 'captured':
      return 'CAPTURED';
    case 'authorized':
      return 'AUTHORIZED';
    case 'failed':
      return 'FAILED';
    case 'refunded':
      return 'REFUNDED';
    case 'created':
      return 'CREATED';
    default:
      return 'PENDING';
  }
}

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  if (!env.DB) {
    return jsonResponse({ success: false, error: 'Database binding (DB) is not configured.' }, 503);
  }

  const keyId = env.RAZORPAY_KEY_ID?.trim() || '';
  const keySecret = env.RAZORPAY_KEY_SECRET?.trim() || '';
  if (!keyId || !keySecret || keyId.includes('replace_with') || keySecret.includes('replace_with')) {
    return jsonResponse(
      { success: false, error: 'Razorpay credentials are not configured on the server.' },
      503
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON payload.' }, 400);
  }

  const orderId = sanitizeText(body.razorpay_order_id, 80);
  const paymentId = sanitizeText(body.razorpay_payment_id, 80);
  const signature = sanitizeText(body.razorpay_signature, 160).toLowerCase();

  if (!orderId || !paymentId || !signature) {
    return jsonResponse(
      {
        success: false,
        verified: false,
        status: 'FAILED',
        error: 'Missing required Razorpay payment verification parameters.',
      },
      400
    );
  }

  const paymentRecord = await env.DB.prepare(
    `SELECT p.id, p.enquiry_id, p.enquiry_reference, p.amount, p.status
     FROM payments p
     WHERE p.razorpay_order_id = ? LIMIT 1`
  )
    .bind(orderId)
    .first<{
      id: number;
      enquiry_id: number | null;
      enquiry_reference: string;
      amount: number;
      status: string;
    }>();

  if (!paymentRecord) {
    return jsonResponse(
      { success: false, verified: false, error: 'Payment order not found.' },
      404
    );
  }

  // Step 7: Verify HMAC SHA-256 signature
  const expectedSignature = (await hmacSha256Hex(keySecret, `${orderId}|${paymentId}`)).toLowerCase();
  const signatureValid = constantTimeEqual(expectedSignature, signature);

  if (!signatureValid) {
    await env.DB.prepare(
      `UPDATE payments
       SET status = 'FAILED', verification_status = 'FAILED', updated_at = datetime('now')
       WHERE id = ?`
    )
      .bind(paymentRecord.id)
      .run();

    return jsonResponse(
      {
        success: false,
        verified: false,
        status: 'FAILED',
        error: 'Payment signature verification failed.',
      },
      400
    );
  }

  // Step 8: Independently verify actual payment & order status via Razorpay REST API
  // Never confuse AUTHORIZED with CAPTURED!
  let resolvedState: PaymentState = 'PENDING';
  let verificationState: VerificationState = 'UNVERIFIED';

  try {
    const authToken = btoa(`${keyId}:${keySecret}`);
    const rzpRes = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Basic ${authToken}` },
    });

    if (rzpRes.ok) {
      const rzpPayment = (await rzpRes.json()) as {
        id?: string;
        order_id?: string;
        amount?: number;
        status?: string;
      };
      if (
        rzpPayment.order_id === orderId &&
        Number(rzpPayment.amount) === Number(paymentRecord.amount)
      ) {
        resolvedState = mapRazorpayStatus(rzpPayment.status);
        verificationState = resolvedState === 'CAPTURED' ? 'VERIFIED' : 'UNVERIFIED';
      } else {
        resolvedState = 'FAILED';
        verificationState = 'FAILED';
      }
    } else {
      // Gateway timeout / delayed status: preserve PENDING without claiming success
      resolvedState = 'PENDING';
      verificationState = 'UNVERIFIED';
    }
  } catch {
    resolvedState = 'PENDING';
    verificationState = 'UNVERIFIED';
  }

  await env.DB.prepare(
    `UPDATE payments
     SET razorpay_payment_id = ?, status = ?, verification_status = ?,
         transaction_timestamp = datetime('now'), updated_at = datetime('now')
     WHERE id = ?`
  )
    .bind(paymentId, resolvedState, verificationState, paymentRecord.id)
    .run();

  if (resolvedState === 'CAPTURED' && paymentRecord.enquiry_id) {
    await env.DB.prepare(`UPDATE enquiries SET status = 'Paid' WHERE id = ?`)
      .bind(paymentRecord.enquiry_id)
      .run();
  }

  return jsonResponse({
    success: resolvedState === 'CAPTURED',
    verified: resolvedState === 'CAPTURED' && verificationState === 'VERIFIED',
    status: resolvedState,
    verificationStatus: verificationState,
    orderId,
    paymentId,
    referenceNumber: paymentRecord.enquiry_reference,
    message:
      resolvedState === 'CAPTURED'
        ? 'Payment captured and verified.'
        : resolvedState === 'AUTHORIZED'
          ? 'Payment is authorized and awaiting capture confirmation.'
          : 'Payment status is being verified. Please do not make another payment until the transaction status is checked.',
  });
};
