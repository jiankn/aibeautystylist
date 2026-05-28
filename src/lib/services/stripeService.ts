/**
 * Stripe Service — 订阅支付集成
 *
 * 直接使用 Stripe REST API（不引入 SDK），保持 Cloudflare Workers 兼容性。
 * 提供 Checkout Session 创建、Webhook 验证、Customer Portal 等核心能力。
 */
import type { RuntimeEnv } from '../cloudflare/runtime';
import { getRuntimeValue } from '../cloudflare/runtime';
import { findUserById, updateUserStripeCustomer, updateUserTier } from '../repositories/userRepository';
import {
  createSubscription,
  updateSubscriptionStatus,
  findSubscriptionByStripeId,
  findPlanById,
  parsePlanFeatures,
} from '../repositories/subscriptionRepository';

// ─── Stripe API 配置 ────────────────────────────────────────
const STRIPE_API_BASE = 'https://api.stripe.com/v1';

// ─── 辅助方法 ───────────────────────────────────────────────
function getStripeKey(env?: RuntimeEnv): string | null {
  return getRuntimeValue(env, 'STRIPE_SECRET_KEY') ?? null;
}

async function stripeRequest(
  apiKey: string,
  path: string,
  params?: Record<string, string>,
  method: 'GET' | 'POST' = 'POST',
): Promise<Record<string, unknown>> {
  const url = `${STRIPE_API_BASE}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const body = params ? new URLSearchParams(params).toString() : undefined;

  const resp = await fetch(url, {
    method,
    headers,
    body: method === 'POST' ? body : undefined,
  });

  const data = await resp.json() as Record<string, unknown>;

  if (!resp.ok) {
    const err = (data.error as Record<string, unknown>)?.message ?? resp.statusText;
    throw new Error(`Stripe API error: ${err}`);
  }

  return data;
}

// ─── Checkout Session 创建 ──────────────────────────────────
export interface CreateCheckoutInput {
  userId: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(
  env: RuntimeEnv | undefined,
  input: CreateCheckoutInput,
): Promise<{ checkoutUrl: string }> {
  const apiKey = getStripeKey(env);
  if (!apiKey) throw new Error('STRIPE_SECRET_KEY not configured');

  // 查找用户和计划
  const user = await findUserById(env, input.userId);
  if (!user) throw new Error('User not found');

  const plan = await findPlanById(env, input.planId);
  if (!plan) throw new Error(`Plan not found: ${input.planId}`);

  // Price ID 解析顺序：D1 plans.stripe_price_id → env STRIPE_PRICE_*_MONTHLY
  // 让本地开发只需填 .dev.vars 即可跑通，无需先 seed D1
  const priceIdFromEnv = (() => {
    if (input.planId === 'pro_monthly') return getRuntimeValue(env, 'STRIPE_PRICE_PRO_MONTHLY');
    if (input.planId === 'pro_yearly') return getRuntimeValue(env, 'STRIPE_PRICE_PRO_YEARLY');
    if (input.planId === 'premium_monthly') return getRuntimeValue(env, 'STRIPE_PRICE_PREMIUM_MONTHLY');
    if (input.planId === 'premium_yearly') return getRuntimeValue(env, 'STRIPE_PRICE_PREMIUM_YEARLY');
    if (input.planId === 'single_occasion') return getRuntimeValue(env, 'STRIPE_PRICE_SINGLE_OCCASION');
    return undefined;
  })();
  const priceId = plan.stripe_price_id || priceIdFromEnv;
  if (!priceId) {
    throw new Error(
      `Missing Stripe price ID for plan "${input.planId}". ` +
      `Set STRIPE_PRICE_* in .dev.vars, ` +
      `or seed D1 plans.stripe_price_id.`,
    );
  }

  // 创建或复用 Stripe Customer
  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripeRequest(apiKey, '/customers', {
      ...(user.email ? { email: user.email } : {}),
      ...(user.name ? { name: user.name } : {}),
      'metadata[user_id]': user.id,
    });
    customerId = customer.id as string;
    await updateUserStripeCustomer(env, user.id, customerId);
  }

  // 创建 Checkout Session
  const checkoutMode = plan.interval ? 'subscription' : 'payment';
  const checkoutParams: Record<string, string> = {
    customer: customerId,
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    mode: checkoutMode,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    'metadata[user_id]': input.userId,
    'metadata[plan_id]': input.planId,
    allow_promotion_codes: 'true',
  };

  if (checkoutMode === 'subscription') {
    checkoutParams['subscription_data[metadata][user_id]'] = input.userId;
    checkoutParams['subscription_data[metadata][plan_id]'] = input.planId;
  } else {
    checkoutParams['payment_intent_data[metadata][user_id]'] = input.userId;
    checkoutParams['payment_intent_data[metadata][plan_id]'] = input.planId;
  }

  const session = await stripeRequest(apiKey, '/checkout/sessions', checkoutParams);

  return { checkoutUrl: session.url as string };
}

// ─── Customer Portal ────────────────────────────────────────
export async function createPortalSession(
  env: RuntimeEnv | undefined,
  userId: string,
  returnUrl: string,
): Promise<{ portalUrl: string }> {
  const apiKey = getStripeKey(env);
  if (!apiKey) throw new Error('STRIPE_SECRET_KEY not configured');

  const user = await findUserById(env, userId);
  if (!user?.stripe_customer_id) throw new Error('No Stripe customer found');

  const session = await stripeRequest(apiKey, '/billing_portal/sessions', {
    customer: user.stripe_customer_id,
    return_url: returnUrl,
  });

  return { portalUrl: session.url as string };
}

// ─── Webhook 签名验证 ───────────────────────────────────────
export async function verifyWebhookSignature(
  payload: string,
  sigHeader: string,
  webhookSecret: string,
): Promise<boolean> {
  // Stripe Webhook 签名格式: t=timestamp,v1=signature
  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parts['t'];
  const signature = parts['v1'];
  if (!timestamp || !signature) return false;

  // 检查时间戳（防止重放攻击，允许 5 分钟偏差）
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > 300) return false;

  // 计算 HMAC-SHA256 签名
  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return expectedSig === signature;
}

// ─── Webhook 事件处理 ───────────────────────────────────────
/**
 * 记录已处理的 Stripe event id，幂等防重放。
 * 返回 true 表示首次处理，false 表示已处理过应跳过。
 */
async function reserveStripeEvent(
  env: RuntimeEnv | undefined,
  eventId: string,
  type: string,
): Promise<boolean> {
  const db = env?.DB;
  if (!db || !eventId) return true;
  try {
    const result = await db
      .prepare('INSERT OR IGNORE INTO stripe_events (event_id, type) VALUES (?, ?)')
      .bind(eventId, type)
      .run();
    const meta = (result as { meta?: { changes?: number } }).meta;
    if (meta && typeof meta.changes === 'number' && meta.changes === 0) {
      console.log(`[Stripe Webhook] Skipping duplicate event: ${eventId}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn('[Stripe Webhook] reserveStripeEvent failed; processing without idempotency guard:', error);
    return true;
  }
}

export async function handleWebhookEvent(
  env: RuntimeEnv | undefined,
  event: Record<string, unknown>,
): Promise<void> {
  const eventId = event.id as string | undefined;
  const type = event.type as string;
  const data = (event.data as Record<string, unknown>)?.object as Record<string, unknown>;
  if (!data) return;

  if (eventId) {
    const fresh = await reserveStripeEvent(env, eventId, type);
    if (!fresh) return;
  }

  console.log(`[Stripe Webhook] Processing: ${type}`);

  switch (type) {
    case 'checkout.session.completed': {
      const subscriptionId = data.subscription as string;
      const metadata = data.metadata as Record<string, string> | undefined;
      // metadata 在 subscription_data 中，需要从 subscription 获取
      if (subscriptionId) {
        await handleSubscriptionCreated(env, subscriptionId);
      } else {
        await handleOneTimeCheckoutCompleted(env, data);
      }
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      await handleSubscriptionUpdated(env, data);
      break;
    }

    case 'customer.subscription.deleted': {
      await handleSubscriptionDeleted(env, data);
      break;
    }

    default:
      console.log(`[Stripe Webhook] Unhandled event: ${type}`);
  }
}

async function handleSubscriptionCreated(
  env: RuntimeEnv | undefined,
  stripeSubscriptionId: string,
): Promise<void> {
  const apiKey = getStripeKey(env);
  if (!apiKey) return;

  // 从 Stripe 获取完整 subscription 信息
  const sub = await stripeRequest(apiKey, `/subscriptions/${stripeSubscriptionId}`, undefined, 'GET');
  await handleSubscriptionUpdated(env, sub);
}

async function handleOneTimeCheckoutCompleted(
  env: RuntimeEnv | undefined,
  data: Record<string, unknown>,
): Promise<void> {
  const sessionId = data.id as string;
  const mode = data.mode as string | undefined;
  const paymentStatus = data.payment_status as string | undefined;
  const metadata = data.metadata as Record<string, string> | undefined;
  const userId = metadata?.user_id;
  const planId = metadata?.plan_id;
  if (!sessionId || mode !== 'payment' || !userId || !planId) return;
  if (paymentStatus && paymentStatus !== 'paid' && paymentStatus !== 'no_payment_required') return;

  const existing = await findSubscriptionByStripeId(env, sessionId);
  if (existing) return;

  const plan = await findPlanById(env, planId);
  if (!plan || plan.interval) return;

  const features = parsePlanFeatures(plan);
  const periodDays = features.historyDays > 0 ? features.historyDays : 30;
  const periodStart = new Date();
  const periodEnd = new Date(periodStart.getTime() + periodDays * 24 * 60 * 60 * 1000);

  await createSubscription(env, {
    userId,
    planId,
    stripeSubscriptionId: sessionId,
    status: 'active',
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
  });
  await updateUserTier(env, userId, plan.tier);
}

async function handleSubscriptionUpdated(
  env: RuntimeEnv | undefined,
  data: Record<string, unknown>,
): Promise<void> {
  const stripeSubId = data.id as string;
  const status = data.status as string;
  const metadata = data.metadata as Record<string, string> | undefined;
  const userId = metadata?.user_id;
  let planId = metadata?.plan_id;
  const currentPeriod = data.current_period_start as number | undefined;
  const currentPeriodEnd = data.current_period_end as number | undefined;
  const cancelAtPeriodEnd = data.cancel_at_period_end as boolean;

  if (!stripeSubId) return;

  // 查找已有 subscription 或创建新的
  const existing = await findSubscriptionByStripeId(env, stripeSubId);
  planId = planId ?? existing?.plan_id;

  if (existing) {
    await updateSubscriptionStatus(env, stripeSubId, {
      status,
      planId: planId ?? undefined,
      periodStart: currentPeriod ? new Date(currentPeriod * 1000).toISOString() : undefined,
      periodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : undefined,
      cancelAtPeriodEnd,
    });
  } else if (userId && planId) {
    await createSubscription(env, {
      userId,
      planId,
      stripeSubscriptionId: stripeSubId,
      status,
      periodStart: currentPeriod ? new Date(currentPeriod * 1000).toISOString() : undefined,
      periodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : undefined,
    });
  }

  // 同步用户 tier
  const effectiveUserId = userId ?? existing?.user_id;
  if (effectiveUserId) {
    const plan = planId ? await findPlanById(env, planId) : null;
    const hasEntitlement = status === 'active' || status === 'trialing';
    const tier = hasEntitlement && plan ? plan.tier : 'free';
    await updateUserTier(env, effectiveUserId, tier as 'free' | 'pro' | 'premium');
  }
}

async function handleSubscriptionDeleted(
  env: RuntimeEnv | undefined,
  data: Record<string, unknown>,
): Promise<void> {
  const stripeSubId = data.id as string;
  if (!stripeSubId) return;

  const existing = await findSubscriptionByStripeId(env, stripeSubId);
  if (existing) {
    await updateSubscriptionStatus(env, stripeSubId, { status: 'canceled' });
    // 降级到 Free
    await updateUserTier(env, existing.user_id, 'free');
  }
}
