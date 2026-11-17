import { checkRateLimit, jsonResponse, sanitizeText } from '../../lib/security';
import { PACKAGE_CATALOG, PagesFunction } from '../../lib/types';

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  if (!env.DB) {
    return jsonResponse(
      {
        success: false,
        configured: false,
        error: 'Database binding (DB) is not configured on the server.',
      },
      503
    );
  }

  const keyId = env.RAZORPAY_KEY_ID?.trim() || '';
  const keySecret = env.RAZORPAY_KEY_SECRET?.trim() || '';
  if (!keyId || !keySecret || keyId.includes('replace_with') || keySecret.includes('replace_with')) {
    return jsonResponse(
      {
        success: false,
        configured: false,
        error: 'Razorpay credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are not configured on the server.',
      },
      503
    );
  }

  const rateLimit = await checkRateLimit(env.DB, request, 'payment_create_order', 10, 600);
  if (!rateLimit.allowed) {
    return jsonResponse(
      {
        success: false,
        error: 'Too many payment attempts. Please wait a few minutes.',
      },
      429
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON request body.' }, 400);
  }

  const referenceNumber = sanitizeText(body.referenceNumber, 40).toUpperCase();
  const packageId = sanitizeText(body.packageId, 24).toLowerCase();
  const customAmountInr = Number(body.customAmountInr);
  const serviceNameInput = sanitizeText(body.serviceName, 120);

  if (!referenceNumber) {
    return jsonResponse(
      { success: false, error: 'A valid enquiry reference number is required before initiating payment.' },
      400
    );
  }

  const enquiry = await env.DB.prepare(
    `SELECT id, reference_number, full_name, email, phone, service
     FROM enquiries WHERE reference_number = ? LIMIT 1`
  )
    .bind(referenceNumber)
    .first<{
      id: number;
      reference_number: string;
      full_name: string;
      email: string;
      phone: string;
      service: string;
    }>();

  if (!enquiry) {
    return jsonResponse(
      {
        success: false,
        error: 'Enquiry reference number was not found. Please submit your project enquiry first.',
      },
      404
    );
  }

  // Server-authoritative amount calculation:
  // Standard packages resolve from PACKAGE_CATALOG; custom quotation payments require a positive bounded INR integer (₹100 to ₹5,00,000)
  let amountPaise = 0;
  let amountInr = 0;
  let resolvedLabel = serviceNameInput || enquiry.service;

  if (packageId && PACKAGE_CATALOG[packageId]) {
    const pkg = PACKAGE_CATALOG[packageId];
    amountPaise = pkg.amountPaise;
    amountInr = pkg.amountInr;
    resolvedLabel = pkg.name;
  } else if (
    packageId === 'custom' &&
    Number.isFinite(customAmountInr) &&
    Number.isInteger(customAmountInr) &&
    customAmountInr >= 100 &&
    customAmountInr <= 500000
  ) {
    amountInr = customAmountInr;
    amountPaise = customAmountInr * 100;
    resolvedLabel = serviceNameInput || 'Custom Quotation Payment';
  } else {
    return jsonResponse(
      {
        success: false,
        error: 'Invalid package or amount. Custom amounts must be a whole INR figure between ₹100 and ₹5,00,000.',
      },
      400
    );
  }

  const authToken = btoa(`${keyId}:${keySecret}`);
  let razorpayRes: Response;
  try {
    razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: `${enquiry.reference_number}-${Date.now().toString().slice(-6)}`.slice(0, 40),
        notes: {
          enquiry_reference: enquiry.reference_number,
          service_or_package: resolvedLabel,
          customer_email: enquiry.email,
        },
      }),
    });
  } catch {
    return jsonResponse(
      {
        success: false,
        error: 'Unable to reach Razorpay servers. Please check connectivity and try again.',
      },
      504
    );
  }

  const orderData = (await razorpayRes.json().catch(() => ({}))) as {
    id?: string;
    amount?: number;
    currency?: string;
    error?: { description?: string };
  };

  if (!razorpayRes.ok || !orderData.id) {
    return jsonResponse(
      {
        success: false,
        error: orderData.error?.description || 'Failed to create Razorpay payment order.',
      },
      502
    );
  }

  await env.DB.prepare(
    `INSERT INTO payments (
      enquiry_id, enquiry_reference, customer_name, customer_email,
      service_name, razorpay_order_id, amount, currency, status, verification_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'INR', 'CREATED', 'UNVERIFIED')`
  )
    .bind(
      enquiry.id,
      enquiry.reference_number,
      enquiry.full_name,
      enquiry.email,
      resolvedLabel,
      orderData.id,
      amountPaise
    )
    .run();

  return jsonResponse({
    success: true,
    orderId: orderData.id,
    amount: amountPaise,
    amountInr,
    currency: 'INR',
    keyId,
    status: 'CREATED',
    packageName: resolvedLabel,
    referenceNumber: enquiry.reference_number,
    prefill: {
      name: enquiry.full_name,
      email: enquiry.email,
      contact: enquiry.phone,
    },
  });
};
