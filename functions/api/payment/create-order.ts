import {
  checkRateLimit,
  generateReferenceNumber,
  isValidEmail,
  jsonResponse,
  normalizeIndianPhone,
  sanitizeText,
} from '../../lib/security';
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
        retryAfterSeconds: rateLimit.retryAfterSeconds,
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

  let referenceNumber = sanitizeText(body.referenceNumber, 40).toUpperCase();
  const packageId = sanitizeText(body.packageId, 24).toLowerCase();
  const customAmountInr = Number(body.customAmountInr);
  const serviceNameInput = sanitizeText(body.serviceName, 120);

  let enquiry: {
    id: number;
    reference_number: string;
    full_name: string;
    email: string;
    phone: string;
    service: string;
  } | null = null;

  if (referenceNumber) {
    enquiry = await env.DB.prepare(
      `SELECT id, reference_number, full_name, email, phone, service
       FROM enquiries WHERE reference_number = ? LIMIT 1`
    )
      .bind(referenceNumber)
      .first();

    if (!enquiry) {
      return jsonResponse(
        {
          success: false,
          error: 'Enquiry reference number was not found. Please submit your project enquiry first.',
        },
        404
      );
    }
  } else {
    const customerName = sanitizeText(body.customerName ?? body.fullName ?? body.name, 120);
    const customerEmail = sanitizeText(body.customerEmail ?? body.email, 160).toLowerCase();
    const rawPhone = sanitizeText(body.customerPhone ?? body.phone, 24);
    const normalizedPhone = normalizeIndianPhone(rawPhone);

    if (customerName.length < 2 || !isValidEmail(customerEmail) || !normalizedPhone) {
      return jsonResponse(
        {
          success: false,
          error:
            'Provide an existing enquiry referenceNumber, or valid customerName, customerEmail, and 10-digit Indian customerPhone.',
        },
        400
      );
    }

    referenceNumber = generateReferenceNumber();
    const fallbackService = serviceNameInput || PACKAGE_CATALOG[packageId]?.name || 'Custom Consultation';

    const insertEnquiry = await env.DB.prepare(
      `INSERT INTO enquiries (
        reference_number, full_name, business_name, email, phone,
        category, service, services_json, package, budget, description,
        additional_requirements, contact_preference, status
      ) VALUES (?, ?, '', ?, ?, 'Direct Checkout', ?, ?, ?, '', 'Direct package payment order initiated', '', 'WhatsApp', 'New')`
    )
      .bind(
        referenceNumber,
        customerName,
        customerEmail,
        normalizedPhone,
        fallbackService,
        JSON.stringify([fallbackService]),
        PACKAGE_CATALOG[packageId]?.name || 'Custom Quote'
      )
      .run();

    if (!insertEnquiry.success) {
      return jsonResponse(
        { success: false, error: 'Unable to register checkout reference in database.' },
        500
      );
    }

    enquiry = {
      id: Number(insertEnquiry.meta.last_row_id ?? 0),
      reference_number: referenceNumber,
      full_name: customerName,
      email: customerEmail,
      phone: normalizedPhone,
      service: fallbackService,
    };
  }

  // Prevent duplicate payment processing if a verified CAPTURED payment already exists for this enquiry
  const existingCaptured = await env.DB.prepare(
    `SELECT razorpay_order_id, razorpay_payment_id
     FROM payments
     WHERE enquiry_reference = ? AND status = 'CAPTURED' AND verification_status = 'VERIFIED'
     LIMIT 1`
  )
    .bind(enquiry.reference_number)
    .first<{ razorpay_order_id: string; razorpay_payment_id: string | null }>();

  if (existingCaptured) {
    return jsonResponse(
      {
        success: false,
        duplicate: true,
        orderId: existingCaptured.razorpay_order_id,
        paymentId: existingCaptured.razorpay_payment_id,
        error: `A verified payment (${existingCaptured.razorpay_order_id}) has already been captured for enquiry ${enquiry.reference_number}.`,
      },
      409
    );
  }

  // Server-authoritative amount calculation:
  // Standard packages resolve strictly from PACKAGE_CATALOG; custom quotations require integer INR ₹100–₹5,00,000.
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
