/**
 * POST /api/auth/logout — 登出（清除 session）
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/cloudflare/runtime';
import { logout, buildClearSessionCookie } from '../../../lib/services/authService';

export const POST: APIRoute = async ({ request, redirect }) => {
  const env = getRuntimeEnv();
  const cookieHeader = request.headers.get('cookie');

  await logout(env, cookieHeader);

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': buildClearSessionCookie(),
    },
  });
};
