/**
 * GET /api/account/overview — Dashboard 总览数据
 *
 * 返回当前用户：
 *  - 基本信息（email/name/avatar/tier）
 *  - 当前订阅状态（plan / 续费日期 / 是否在期末取消）
 *  - 今日剩余次数（diagnosis / makeup_render）
 *  - 历史试妆总数 + 最近 3 条试妆缩略图
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/cloudflare/runtime';
import { getAuthUser } from '../../../lib/services/authService';
import {
  findActiveSubscription,
  findPlanById,
} from '../../../lib/repositories/subscriptionRepository';
import {
  countJobsByUserId,
  listJobsByUserId,
} from '../../../lib/repositories/tryOnJobRepository';
import { getUsageState } from '../../../lib/services/usageLimitService';

export const GET: APIRoute = async ({ request }) => {
  const env = getRuntimeEnv();
  const cookieHeader = request.headers.get('cookie');
  const authUser = await getAuthUser(env, cookieHeader).catch(() => null);

  if (!authUser) {
    return new Response(
      JSON.stringify({ error: 'unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // ── 订阅信息 ──────────────────────────────────────────────
  const subscription = await findActiveSubscription(env, authUser.id);
  const plan = subscription ? await findPlanById(env, subscription.plan_id) : null;

  // ── 用量信息 ──────────────────────────────────────────────
  // 兼容 cloudflare adapter：从 headers 取客户端 IP（不依赖 Astro.clientAddress）
  const ipAddress =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '0.0.0.0';

  const usageWindow = authUser.tier === 'free' ? 'daily' : 'monthly';
  const diagnosisUsage = await getUsageState({
    env,
    ipAddress,
    userId: authUser.id,
    actionType: 'tryon_diagnosis',
    limit: authUser.features.diagnosisLimit,
    hardCap: authUser.features.diagnosisHardCap,
    window: usageWindow,
  });

  // ── 试妆历史 ──────────────────────────────────────────────
  const [historyCount, recentJobs] = await Promise.all([
    countJobsByUserId(env, authUser.id),
    listJobsByUserId(env, authUser.id, { limit: 3 }),
  ]);

  return new Response(
    JSON.stringify({
      user: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
        avatarUrl: authUser.avatarUrl,
        tier: authUser.tier,
      },
      subscription: subscription
        ? {
            planId: subscription.plan_id,
            planName: plan?.name ?? subscription.plan_id,
            status: subscription.status,
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
          }
        : null,
      usage: {
        diagnosis: {
          limit: diagnosisUsage.limit,
          used: diagnosisUsage.count,
          remaining: diagnosisUsage.remaining,
          window: diagnosisUsage.window,
        },
      },
      history: {
        total: historyCount,
        recent: recentJobs,
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
