import { jsonResponse } from '../lib/security';
import { PACKAGE_CATALOG, PagesFunction } from '../lib/types';

export const onRequestGet: PagesFunction = async ({ env }) => {
  const razorpayKeyId = env.RAZORPAY_KEY_ID?.trim() || '';
  const razorpaySecret = env.RAZORPAY_KEY_SECRET?.trim() || '';
  const razorpayConfigured =
    razorpayKeyId.length > 0 &&
    razorpaySecret.length > 0 &&
    !razorpayKeyId.includes('replace_with') &&
    !razorpaySecret.includes('replace_with');

  const resendKey = env.RESEND_API_KEY?.trim() || '';
  const senderEmail = (env.SENDER_EMAIL || env.EMAIL_FROM || '').trim();
  const resendConfigured =
    resendKey.length > 0 &&
    senderEmail.length > 0 &&
    !resendKey.includes('replace_with');

  const whatsappRaw = (env.WHATSAPP_NUMBER || '917319785754').replace(/[^\d]/g, '');
  const whatsappConfigured = whatsappRaw.length >= 10 && !/^910+$/.test(whatsappRaw);

  return jsonResponse({
    success: true,
    whatsappNumber: whatsappRaw,
    whatsappConfigured,
    razorpayConfigured,
    razorpayKeyId: razorpayConfigured ? razorpayKeyId : null,
    razorpayMode: razorpayKeyId.startsWith('rzp_live_') ? 'live' : 'test',
    resendConfigured,
    d1Configured: Boolean(env.DB),
    supabaseConfigured: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
    adminConfigured: Boolean(env.ADMIN_ACCESS_TOKEN && !env.ADMIN_ACCESS_TOKEN.includes('replace_with')),
    packages: Object.values(PACKAGE_CATALOG),
  });
};
