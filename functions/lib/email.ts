import { escapeHtml, stripHeaderNewlines, ValidatedEnquiry } from './security';
import { Env } from './types';

export interface EmailDispatchResult {
  configured: boolean;
  sent: boolean;
  businessEmailId?: string;
  customerEmailId?: string;
  error?: string;
}

function getEmailConfig(env: Env): { apiKey: string; from: string; contactEmail: string } | null {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = stripHeaderNewlines((env.SENDER_EMAIL || env.EMAIL_FROM || '').trim());
  const contactEmail = stripHeaderNewlines(
    (env.CONTACT_EMAIL || env.BUSINESS_EMAIL || 'educationrevolution90@gmail.com').trim()
  );
  if (
    !apiKey ||
    !from ||
    apiKey.includes('replace_with') ||
    from.includes('replace_with') ||
    from.includes('yourdomain.com')
  ) {
    return null;
  }
  return { apiKey, from, contactEmail };
}

async function sendResendEmail(
  apiKey: string,
  payload: {
    from: string;
    to: string[];
    reply_to?: string;
    subject: string;
    html: string;
    text: string;
  }
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const safePayload = {
    ...payload,
    from: stripHeaderNewlines(payload.from),
    to: payload.to.map(stripHeaderNewlines),
    reply_to: payload.reply_to ? stripHeaderNewlines(payload.reply_to) : undefined,
    subject: stripHeaderNewlines(payload.subject),
  };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(safePayload),
    });

    const result = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!response.ok || !result.id) {
      return {
        ok: false,
        error: result.message || `Resend API error (${response.status})`,
      };
    }
    return { ok: true, id: result.id };
  } catch {
    return { ok: false, error: 'Network timeout contacting Resend email API.' };
  }
}

export async function dispatchEnquiryEmails(
  env: Env,
  referenceNumber: string,
  enquiry: ValidatedEnquiry
): Promise<EmailDispatchResult> {
  const config = getEmailConfig(env);
  if (!config) {
    return {
      configured: false,
      sent: false,
      error: 'Notification delivery pending: RESEND_API_KEY and SENDER_EMAIL are not configured on the server.',
    };
  }

  const safeName = escapeHtml(enquiry.fullName);
  const safeBusiness = escapeHtml(enquiry.businessName || 'Not provided');
  const safeEmail = escapeHtml(enquiry.email);
  const safePhone = escapeHtml(enquiry.phone);
  const safeServices = escapeHtml(enquiry.serviceSummary);
  const safePackage = escapeHtml(enquiry.selectedPackage);
  const safeBudget = escapeHtml(enquiry.budget || 'Not specified');
  const safeDesc = escapeHtml(enquiry.description || 'No description provided');
  const safeAdditional = escapeHtml(enquiry.additionalRequirements || 'None');
  const safeRef = escapeHtml(referenceNumber);

  const businessHtml = `
    <div style="font-family: Arial, sans-serif; color: #111827; max-width: 640px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
      <div style="background: #0B1020; color: #FFFFFF; padding: 20px 24px;">
        <h2 style="margin: 0; font-size: 18px;">New Project Enquiry — ${safeRef}</h2>
        <p style="margin: 4px 0 0; color: #94A3B8; font-size: 13px;">DIGI TECH SOLUTION Lead Notification</p>
      </div>
      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #64748B; width: 180px;">Reference ID</td><td style="padding: 8px 0; font-weight: bold;">${safeRef}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748B;">Full Name</td><td style="padding: 8px 0;">${safeName}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748B;">Business Name</td><td style="padding: 8px 0;">${safeBusiness}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748B;">Email</td><td style="padding: 8px 0;">${safeEmail}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748B;">WhatsApp / Mobile</td><td style="padding: 8px 0;">${safePhone}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748B;">Services Required</td><td style="padding: 8px 0; font-weight: bold;">${safeServices}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748B;">Selected Package</td><td style="padding: 8px 0; color: #2563EB; font-weight: bold;">${safePackage}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748B;">Estimated Budget</td><td style="padding: 8px 0;">${safeBudget}</td></tr>
        </table>
        <div style="margin-top: 16px; padding: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px;">
          <div style="font-size: 12px; color: #64748B; margin-bottom: 6px;">Project Description</div>
          <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${safeDesc}</div>
          <div style="font-size: 12px; color: #64748B; margin-top: 12px; margin-bottom: 4px;">Additional Requirements</div>
          <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${safeAdditional}</div>
        </div>
      </div>
    </div>
  `;

  const businessText = [
    `New Enquiry: ${referenceNumber}`,
    `Name: ${enquiry.fullName}`,
    `Business: ${enquiry.businessName || 'Not provided'}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone}`,
    `Services: ${enquiry.serviceSummary}`,
    `Package: ${enquiry.selectedPackage}`,
    `Budget: ${enquiry.budget || 'Not specified'}`,
    `Description: ${enquiry.description || 'Not provided'}`,
    `Additional Requirements: ${enquiry.additionalRequirements || 'None'}`,
  ].join('\n');

  const businessRes = await sendResendEmail(config.apiKey, {
    from: config.from,
    to: [config.contactEmail],
    reply_to: enquiry.email,
    subject: `[${referenceNumber}] Enquiry: ${enquiry.serviceSummary.slice(0, 60)} (${enquiry.fullName})`,
    html: businessHtml,
    text: businessText,
  });

  if (!businessRes.ok) {
    return {
      configured: true,
      sent: false,
      error: businessRes.error,
    };
  }

  const customerHtml = `
    <div style="font-family: Arial, sans-serif; color: #111827; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
      <div style="background: #0B1020; color: #FFFFFF; padding: 20px 24px;">
        <h2 style="margin: 0; font-size: 18px;">DIGI TECH SOLUTION</h2>
        <p style="margin: 4px 0 0; color: #94A3B8; font-size: 13px;">Your Digital Growth Partner</p>
      </div>
      <div style="padding: 24px;">
        <p style="margin-top: 0;">Dear ${safeName},</p>
        <p>Thank you for contacting <strong>DIGI TECH SOLUTION</strong>. We have received your enquiry under reference ID <strong>${safeRef}</strong>.</p>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 14px; margin: 16px 0; font-size: 14px;">
          <div><strong>Services:</strong> ${safeServices}</div>
          <div style="margin-top: 6px;"><strong>Contact Number:</strong> ${safePhone}</div>
        </div>
        <p>Our team will review your requirements and get in touch shortly. You can also reach us anytime on WhatsApp at +91 73197 85754.</p>
        <p style="margin-bottom: 0; color: #64748B; font-size: 13px;">Regards,<br/>DIGI TECH SOLUTION<br/>${escapeHtml(config.contactEmail)}</p>
      </div>
    </div>
  `;

  const customerText = `Dear ${enquiry.fullName},\n\nThank you for contacting DIGI TECH SOLUTION.\nReference ID: ${referenceNumber}\nServices: ${enquiry.serviceSummary}\n\nWe will review your requirements and reach out shortly. WhatsApp: +91 73197 85754.\n\nRegards,\nDIGI TECH SOLUTION`;

  const customerRes = await sendResendEmail(config.apiKey, {
    from: config.from,
    to: [enquiry.email],
    reply_to: config.contactEmail,
    subject: `Enquiry Received (${referenceNumber}) — DIGI TECH SOLUTION`,
    html: customerHtml,
    text: customerText,
  });

  return {
    configured: true,
    sent: true,
    businessEmailId: businessRes.id,
    customerEmailId: customerRes.ok ? customerRes.id : undefined,
  };
}

export async function dispatchTestEmail(env: Env): Promise<EmailDispatchResult> {
  const config = getEmailConfig(env);
  if (!config) {
    return {
      configured: false,
      sent: false,
      error: 'Missing RESEND_API_KEY or SENDER_EMAIL server environment variable.',
    };
  }

  const res = await sendResendEmail(config.apiKey, {
    from: config.from,
    to: [config.contactEmail],
    subject: 'DIGI TECH SOLUTION — Resend Integration Verification',
    html: `<p>Live email test from <strong>DIGI TECH SOLUTION</strong> Cloudflare backend (${new Date().toISOString()}).</p>`,
    text: `Live email test from DIGI TECH SOLUTION backend (${new Date().toISOString()}).`,
  });

  if (!res.ok) {
    return { configured: true, sent: false, error: res.error };
  }

  return {
    configured: true,
    sent: true,
    businessEmailId: res.id,
  };
}
