/**
 * POST /api/stripe/create-checkout — 创建 Stripe Checkout Session
 * 需要登录，根据 planId 创建支付链接
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/cloudflare/runtime';
import { getAuthUser } from '../../../lib/services/authService';
import { createCheckoutSession } from '../../../lib/services/stripeService';

export const POST: APIRoute = async ({ request }) => {
  const env = getRuntimeEnv();
  const cookieHeader = request.headers.get('cookie');
  const authUser = await getAuthUser(env, cookieHeader).catch(() => null);

  if (!authUser) {
    return new Response(
      JSON.stringify({ error: 'unauthorized', message: 'Please sign in first' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const planId = body.planId as string;

  if (!planId) {
    return new Response(
      JSON.stringify({ error: 'missing_plan', message: 'planId is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const origin = new URL(request.url).origin;
    const { checkoutUrl } = await createCheckoutSession(env, {
      userId: authUser.id,
      planId,
      successUrl: `${origin}/membership?payment=success`,
      cancelUrl: `${origin}/membership?payment=canceled`,
    });

    return new Response(
      JSON.stringify({ url: checkoutUrl }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    console.error('[stripe/create-checkout]', message);
    return new Response(
      JSON.stringify({ error: 'checkout_failed', message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
