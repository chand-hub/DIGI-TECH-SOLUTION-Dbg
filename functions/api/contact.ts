import { dispatchEnquiryEmails } from '../lib/email';
import {
  checkRateLimit,
  generateReferenceNumber,
  jsonResponse,
  sanitizeText,
  validateEnquiryPayload,
} from '../lib/security';
import { ALLOWED_SERVICES, PagesFunction } from '../lib/types';

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  if (env.DB) {
    const rateLimit = await checkRateLimit(env.DB, request, 'contact', 8, 600);
    if (!rateLimit.allowed) {
      return jsonResponse(
        {
          success: false,
          error: 'Too many contact requests. Please wait a few minutes and try again.',
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        429
      );
    }
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON request payload.' }, 400);
  }

  const rawServicesList: string[] = Array.isArray(body.services)
    ? body.services.map((s) => sanitizeText(s, 100)).filter(Boolean)
    : typeof body.service === 'string' && sanitizeText(body.service, 100)
      ? [sanitizeText(body.service, 100)]
      : ['General Contact'];

  const matchedServices = rawServicesList.filter((s) =>
    (ALLOWED_SERVICES as readonly string[]).includes(s)
  );
  const customServiceNote =
    matchedServices.length === 0 && rawServicesList.length > 0
      ? `[Requested Service: ${rawServicesList.join(', ')}] `
      : '';
  const finalServices = matchedServices.length > 0 ? matchedServices : ['General Contact'];

  const rawDescription = sanitizeText(body.description ?? body.message ?? '', 4500);
  const combinedDescription = `${customServiceNote}${rawDescription}`.trim();

  const normalizedPayload: Record<string, unknown> = {
    fullName: body.fullName ?? body.name,
    businessName: body.businessName ?? '',
    email: body.email,
    phone: body.phone,
    category: 'Direct Contact',
    services: finalServices,
    selectedPackage: 'Custom Quote',
    budget: sanitizeText(body.budget ?? '', 80),
    description: combinedDescription,
    additionalRequirements: sanitizeText(body.additionalRequirements ?? '', 3000),
    contactPreference: body.contactPreference ?? 'WhatsApp',
    website_url: body.website_url,
  };

  const validation = validateEnquiryPayload(normalizedPayload);
  if (!validation.ok) {
    return jsonResponse(
      {
        success: false,
        error: validation.error,
        fieldErrors: validation.fieldErrors,
      },
      400
    );
  }

  const entry = validation.data;
  let storedInD1 = false;
  let enquiryId: number | null = null;

  if (env.DB) {
    const recentDuplicate = await env.DB.prepare(
      `SELECT reference_number FROM enquiries
       WHERE email = ? AND service = ? AND description = ?
         AND datetime(created_at) >= datetime('now', '-120 seconds')
       LIMIT 1`
    )
      .bind(entry.email, entry.serviceSummary, entry.description)
      .first<{ reference_number: string }>();

    if (recentDuplicate) {
      return jsonResponse(
        {
          success: false,
          error: `A duplicate contact request was already submitted moments ago (Reference: ${recentDuplicate.reference_number}).`,
          referenceNumber: recentDuplicate.reference_number,
        },
        409
      );
    }
  }

  const referenceNumber = generateReferenceNumber();

  if (env.DB) {
    const insertResult = await env.DB.prepare(
      `INSERT INTO enquiries (
        reference_number, full_name, business_name, email, phone,
        category, service, services_json, package, budget, description,
        additional_requirements, contact_preference, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')`
    )
      .bind(
        referenceNumber,
        entry.fullName,
        entry.businessName,
        entry.email,
        entry.phone,
        entry.category,
        entry.serviceSummary,
        JSON.stringify(entry.services),
        entry.selectedPackage,
        entry.budget,
        entry.description,
        entry.additionalRequirements,
        entry.contactPreference
      )
      .run();

    if (!insertResult.success) {
      return jsonResponse(
        {
          success: false,
          error: 'Failed to store contact request in database.',
        },
        500
      );
    }
    storedInD1 = true;
    enquiryId = insertResult.meta.last_row_id ?? null;
  }

  const emailNotification = await dispatchEnquiryEmails(env, referenceNumber, entry);

  if (!storedInD1 && !emailNotification.sent) {
    return jsonResponse(
      {
        success: false,
        storedInD1: false,
        emailNotification,
        error:
          emailNotification.error ||
          'Neither Cloudflare D1 database nor Resend email API is configured on the server.',
      },
      503
    );
  }

  return jsonResponse(
    {
      success: true,
      referenceNumber,
      enquiryId,
      storedInD1,
      emailNotification,
    },
    201
  );
};
