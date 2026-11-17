import { getCorsHeaders, jsonResponse } from './lib/security';
import { PagesFunction } from './lib/types';

export const onRequest: PagesFunction = async (context) => {
  const { request, env, next } = context;
  const corsHeaders = getCorsHeaders(request, env);

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  try {
    const response = await next();
    const newHeaders = new Headers(response.headers);

    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('X-Frame-Options', 'DENY');
    newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    for (const [key, val] of Object.entries(corsHeaders)) {
      newHeaders.set(key, val);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch (err) {
    console.error('Unhandled API middleware error:', err);
    return jsonResponse(
      {
        success: false,
        error: 'An unexpected server error occurred. Please try again later.',
      },
      500,
      corsHeaders
    );
  }
};
