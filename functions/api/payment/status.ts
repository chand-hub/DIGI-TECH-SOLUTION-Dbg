import { jsonResponse, sanitizeText } from '../../lib/security';
import { PagesFunction, PaymentState, VerificationState } from '../../lib/types';

function mapRazorpayState(rawStatus: string | undefined): PaymentState {
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

export const onRequestGet: PagesFunction = async ({ request, env }) => {
  if (!env.DB) {
    return jsonResponse({ success: false, error: 'Database binding (DB) is not configured.' }, 503);
  }

  const url = new URL(request.url);
  const orderId = sanitizeText(url.searchParams.get('order_id'), 80);
  const referenceNumber = sanitizeText(url.searchParams.get('ref'), 40).toUpperCase();

  if (!orderId && !referenceNumber) {
    return jsonResponse(
      { success: false, error: 'Provide order_id or ref query parameter to check status.' },
      400
    );
  }

  const payment = orderId
    ? await env.DB.prepare(
        `SELECT id, enquiry_id, enquiry_reference, razorpay_order_id, razorpay_payment_id,
                amount, currency, status, verification_status, transaction_timestamp
         FROM payments WHERE razorpay_order_id = ? LIMIT 1`
      )
        .bind(orderId)
        .first<{
          id: number;
          enquiry_id: number | null;
          enquiry_reference: string;
          razorpay_order_id: string;
          razorpay_payment_id: string | null;
          amount: number;
          currency: string;
          status: PaymentState;
          verification_status: VerificationState;
          transaction_timestamp: string;
        }>()
    : await env.DB.prepare(
        `SELECT id, enquiry_id, enquiry_reference, razorpay_order_id, razorpay_payment_id,
                amount, currency, status, verification_status, transaction_timestamp
         FROM payments WHERE enquiry_reference = ? ORDER BY id DESC LIMIT 1`
      )
        .bind(referenceNumber)
        .first<{
          id: number;
          enquiry_id: number | null;
          enquiry_reference: string;
          razorpay_order_id: string;
          razorpay_payment_id: string | null;
          amount: number;
          currency: string;
          status: PaymentState;
          verification_status: VerificationState;
          transaction_timestamp: string;
        }>();

  if (!payment) {
    return jsonResponse({ success: false, error: 'Payment record not found.' }, 404);
  }

  let currentStatus: PaymentState = payment.status;
  let currentVerification: VerificationState = payment.verification_status;
  let currentPaymentId = payment.razorpay_payment_id;

  // If not finalized yet and Razorpay credentials are configured, fetch live status from Razorpay API
  const keyId = env.RAZORPAY_KEY_ID?.trim() || '';
  const keySecret = env.RAZORPAY_KEY_SECRET?.trim() || '';
  if (
    keyId &&
    keySecret &&
    !keyId.includes('replace_with') &&
    !keySecret.includes('replace_with') &&
    (currentStatus === 'CREATED' || currentStatus === 'PENDING' || currentStatus === 'AUTHORIZED')
  ) {
    try {
      const authToken = btoa(`${keyId}:${keySecret}`);
      const rzpRes = await fetch(
        `https://api.razorpay.com/v1/orders/${encodeURIComponent(payment.razorpay_order_id)}/payments`,
        { headers: { Authorization: `Basic ${authToken}` } }
      );
      if (rzpRes.ok) {
        const listData = (await rzpRes.json()) as {
          items?: Array<{ id: string; status: string; amount: number }>;
        };
        const items = listData.items || [];
        const captured = items.find((i) => i.status === 'captured');
        const authorized = items.find((i) => i.status === 'authorized');
        const failed = items.find((i) => i.status === 'failed');
        const target = captured || authorized || failed;

        if (target) {
          currentStatus = mapRazorpayState(target.status);
          currentPaymentId = target.id;
          currentVerification = currentStatus === 'CAPTURED' ? 'VERIFIED' : currentStatus === 'FAILED' ? 'FAILED' : 'UNVERIFIED';

          await env.DB.prepare(
            `UPDATE payments
             SET razorpay_payment_id = COALESCE(?, razorpay_payment_id),
                 status = ?, verification_status = ?, updated_at = datetime('now')
             WHERE id = ?`
          )
            .bind(currentPaymentId, currentStatus, currentVerification, payment.id)
            .run();

          if (currentStatus === 'CAPTURED' && payment.enquiry_id) {
            await env.DB.prepare(`UPDATE enquiries SET status = 'Paid' WHERE id = ?`)
              .bind(payment.enquiry_id)
              .run();
          }
        }
      }
    } catch {
      // Keep stored state without guessing
    }
  }

  return jsonResponse({
    success: true,
    orderId: payment.razorpay_order_id,
    paymentId: currentPaymentId,
    referenceNumber: payment.enquiry_reference,
    amount: payment.amount,
    amountInr: Math.round(payment.amount / 100),
    currency: payment.currency,
    status: currentStatus,
    verificationStatus: currentVerification,
    transactionTimestamp: payment.transaction_timestamp,
  });
};
