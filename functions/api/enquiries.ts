import { dispatchEnquiryEmails } from '../lib/email';
import {
  checkRateLimit,
  generateReferenceNumber,
  jsonResponse,
  validateEnquiryPayload,
} from '../lib/security';
import { PagesFunction } from '../lib/types';

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  if (!env.DB) {
    return jsonResponse(
      {
        success: false,
        error: 'Database (Cloudflare D1 binding DB) is not configured on the server.',
      },
      503
    );
  }

  const rateLimit = await checkRateLimit(env.DB, request, 'enquiries', 8, 600);
  if (!rateLimit.allowed) {
    return jsonResponse(
      {
        success: false,
        error: 'Too many enquiry submissions from your connection. Please wait a few minutes before trying again.',
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      },
      429
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON request payload.' }, 400);
  }

  const validation = validateEnquiryPayload(body);
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

  const enquiry = validation.data;

  // Prevent accidental duplicate submissions within 120 seconds
  const recentDuplicate = await env.DB.prepare(
    `SELECT reference_number FROM enquiries
     WHERE email = ? AND service = ? AND description = ?
       AND datetime(created_at) >= datetime('now', '-120 seconds')
     LIMIT 1`
  )
    .bind(enquiry.email, enquiry.serviceSummary, enquiry.description)
    .first<{ reference_number: string }>();

  if (recentDuplicate) {
    return jsonResponse(
      {
        success: false,
        error: `A duplicate enquiry was already submitted moments ago (Reference: ${recentDuplicate.reference_number}).`,
        referenceNumber: recentDuplicate.reference_number,
      },
      409
    );
  }

  const referenceNumber = generateReferenceNumber();

  const insertResult = await env.DB.prepare(
    `INSERT INTO enquiries (
      reference_number, full_name, business_name, email, phone,
      category, service, services_json, package, budget, description,
      additional_requirements, contact_preference, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')`
  )
    .bind(
      referenceNumber,
      enquiry.fullName,
      enquiry.businessName,
      enquiry.email,
      enquiry.phone,
      enquiry.category,
      enquiry.serviceSummary,
      JSON.stringify(enquiry.services),
      enquiry.selectedPackage,
      enquiry.budget,
      enquiry.description,
      enquiry.additionalRequirements,
      enquiry.contactPreference
    )
    .run();

  if (!insertResult.success) {
    return jsonResponse(
      {
        success: false,
        error: 'Unable to save your enquiry to the database. Please try again.',
      },
      500
    );
  }

  const emailNotification = await dispatchEnquiryEmails(env, referenceNumber, enquiry);

  return jsonResponse(
    {
      success: true,
      referenceNumber,
      enquiryId: insertResult.meta.last_row_id ?? null,
      emailNotification,
    },
    201
  );
};
