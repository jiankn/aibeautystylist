/**
 * POST /api/stripe/webhook — Stripe Webhook 处理
 * 验证签名 → 分发事件 → 同步 D1 数据
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv, getRuntimeValue } from '../../../lib/cloudflare/runtime';
import { verifyWebhookSignature, handleWebhookEvent } from '../../../lib/services/stripeService';

export const POST: APIRoute = async ({ request }) => {
  const env = getRuntimeEnv();

  const webhookSecret = getRuntimeValue(env, 'STRIPE_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET not configured');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const payload = await request.text();

  // 验证签名
  const isValid = await verifyWebhookSignature(payload, signature, webhookSecret);
  if (!isValid) {
    console.warn('[stripe/webhook] Invalid signature');
    return new Response('Invalid signature', { status: 400 });
  }

  // 解析并处理事件
  try {
    const event = JSON.parse(payload) as Record<string, unknown>;
    await handleWebhookEvent(env, event);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    console.error('[stripe/webhook] Error processing event:', message);
    // 返回 200 避免 Stripe 重试
    return new Response(JSON.stringify({ received: true, error: message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
