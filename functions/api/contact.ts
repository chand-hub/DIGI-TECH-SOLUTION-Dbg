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

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON request payload.' }, 400);
  }

  const normalizedPayload: Record<string, unknown> = {
    fullName: body.fullName ?? body.name,
    businessName: body.businessName ?? '',
    email: body.email,
    phone: body.phone,
    category: 'Direct Contact',
    services: Array.isArray(body.services)
      ? body.services
      : [body.service ?? 'General Contact'],
    selectedPackage: 'Custom Quote',
    budget: '',
    description: body.description ?? body.message ?? '',
    additionalRequirements: '',
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

  const emailNotification = await dispatchEnquiryEmails(env, referenceNumber, entry);

  return jsonResponse(
    {
      success: true,
      referenceNumber,
      emailNotification,
    },
    201
  );
};
