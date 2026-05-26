/**
 * GET /api/auth/login — 重定向到 Google OAuth 授权页
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/cloudflare/runtime';
import { getGoogleAuthUrl } from '../../../lib/services/authService';

export const GET: APIRoute = async ({ request, redirect }) => {
  const env = getRuntimeEnv();
  const url = new URL(request.url);
  const origin = url.origin;
  const next = sanitizeNextPath(url.searchParams.get('next'));
  const redirectUri = `${origin}/api/auth/callback`;

  try {
    const authUrl = getGoogleAuthUrl(env, redirectUri, next);
    return redirect(authUrl, 302);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Auth configuration error';
    console.error('[auth/login]', message);
    return redirect(`/?auth_error=${encodeURIComponent(message)}`, 302);
  }
};

function sanitizeNextPath(next: string | null): string | undefined {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return undefined;
  return next;
}
