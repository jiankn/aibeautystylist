/**
 * GET /api/auth/callback — Google OAuth 回调
 * 接收 authorization code → 换取 token → 创建 session → 重定向
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/cloudflare/runtime';
import { handleGoogleCallback, buildSessionCookie } from '../../../lib/services/authService';

export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const state = url.searchParams.get('state');
  const nextPath = parseNextFromState(state);

  // 用户取消了授权
  if (error) {
    console.warn('[auth/callback] User denied access:', error);
    return redirect('/?auth_error=access_denied', 302);
  }

  if (!code) {
    return redirect('/?auth_error=missing_code', 302);
  }

  const env = getRuntimeEnv();
  const origin = url.origin;
  const redirectUri = `${origin}/api/auth/callback`;
  const isDev = env.APP_ENV !== 'production';

  try {
    const result = await handleGoogleCallback(env, code, redirectUri, {
      userAgent: request.headers.get('user-agent') ?? undefined,
      ipAddress: request.headers.get('cf-connecting-ip') ??
                 request.headers.get('x-forwarded-for') ??
                 undefined,
    });

    if (!result) {
      return redirect('/?auth_error=login_failed', 302);
    }

    console.log(`[auth/callback] User logged in: ${result.user.email} (${result.user.id})`);

    // 设置 session cookie 并重定向到首页
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${nextPath ?? '/try-on'}?login=success`,
        'Set-Cookie': buildSessionCookie(result.sessionId, isDev),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[auth/callback] Error:', message);
    return redirect(`/?auth_error=${encodeURIComponent(message)}`, 302);
  }
};

function parseNextFromState(state: string | null): string | null {
  if (!state?.startsWith('next:')) return null;
  const decoded = decodeURIComponent(state.slice('next:'.length));
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return null;
  return decoded;
}
