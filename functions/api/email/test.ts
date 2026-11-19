import { dispatchTestEmail } from '../../lib/email';
import { checkRateLimit, constantTimeEqual, jsonResponse } from '../../lib/security';
import { PagesFunction } from '../../lib/types';

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const rateLimit = await checkRateLimit(env.DB, request, 'email_test', 4, 600);
  if (!rateLimit.allowed) {
    return jsonResponse(
      {
        success: false,
        error: 'Rate limit exceeded for email diagnostics.',
      },
      429
    );
  }

  const adminToken = env.ADMIN_ACCESS_TOKEN?.trim();
  if (!adminToken || adminToken.includes('replace_with')) {
    return jsonResponse(
      {
        success: false,
        configured: false,
        error: 'ADMIN_ACCESS_TOKEN must be configured on the server to trigger diagnostic test emails.',
      },
      503
    );
  }

  const authHeader = request.headers.get('Authorization') || '';
  const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!provided || !constantTimeEqual(provided, adminToken)) {
    return jsonResponse(
      {
        success: false,
        error: 'Unauthorized. Valid Bearer token required.',
      },
      401
    );
  }

  const result = await dispatchTestEmail(env);
  if (!result.configured) {
    return jsonResponse({ success: false, ...result }, 503);
  }
  if (!result.sent) {
    return jsonResponse({ success: false, ...result }, 502);
  }

  return jsonResponse({
    success: true,
    ...result,
    recipient: env.CONTACT_EMAIL || env.BUSINESS_EMAIL || 'educationrevolution90@gmail.com',
  });
};
