/**
 * POST /api/stripe/create-checkout — 创建 Stripe Checkout Session
 * 需要登录，根据 planId 创建支付链接
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/cloudflare/runtime';
import { getAuthUser } from '../../../lib/services/authService';
import { createCheckoutSession } from '../../../lib/services/stripeService';
import { membershipReturnPath, resolveStripeReturnLocale } from '../../../lib/services/stripeReturnRoutes';
import { findPlanById, type UserTier } from '../../../lib/repositories/subscriptionRepository';

const TIER_RANK: Record<UserTier, number> = {
  free: 0,
  pro: 1,
  premium: 2,
};

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

  const plan = await findPlanById(env, planId);
  if (!plan || plan.tier === 'free') {
    return new Response(
      JSON.stringify({ error: 'invalid_plan', message: 'Choose a paid membership plan.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const requestedTier = plan.tier as UserTier;
  if (requestedTier === authUser.tier) {
    return new Response(
      JSON.stringify({
        error: 'current_plan',
        message: 'You already have this membership tier. Manage billing instead of buying it again.',
      }),
      { status: 409, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (TIER_RANK[requestedTier] < TIER_RANK[authUser.tier]) {
    return new Response(
      JSON.stringify({
        error: 'downgrade_not_supported',
        message: 'Lower-tier changes are handled from Manage Subscription.',
      }),
      { status: 409, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (authUser.tier !== 'free' && TIER_RANK[requestedTier] > TIER_RANK[authUser.tier]) {
    return new Response(
      JSON.stringify({
        error: 'use_portal_for_upgrade',
        message: 'Use Manage Subscription to upgrade an active subscription.',
      }),
      { status: 409, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const origin = new URL(request.url).origin;
    const locale = resolveStripeReturnLocale(request, body);
    const returnPath = membershipReturnPath(locale);
    const { checkoutUrl } = await createCheckoutSession(env, {
      userId: authUser.id,
      planId,
      successUrl: `${origin}${returnPath}?payment=success`,
      cancelUrl: `${origin}${returnPath}?payment=canceled`,
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
