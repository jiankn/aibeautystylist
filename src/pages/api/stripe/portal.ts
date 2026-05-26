/**
 * POST /api/stripe/portal — 创建 Stripe Customer Portal Session
 * 已登录用户可通过此入口管理订阅（升降级/取消/更新支付方式）
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/cloudflare/runtime';
import { getAuthUser } from '../../../lib/services/authService';
import { createPortalSession } from '../../../lib/services/stripeService';

export const POST: APIRoute = async ({ request }) => {
  const env = getRuntimeEnv();
  const cookieHeader = request.headers.get('cookie');
  const authUser = await getAuthUser(env, cookieHeader).catch(() => null);

  if (!authUser) {
    return new Response(
      JSON.stringify({ error: 'unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const origin = new URL(request.url).origin;
    const { portalUrl } = await createPortalSession(env, authUser.id, `${origin}/membership`);

    return new Response(
      JSON.stringify({ url: portalUrl }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Portal creation failed';
    console.error('[stripe/portal]', message);
    return new Response(
      JSON.stringify({ error: 'portal_failed', message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
