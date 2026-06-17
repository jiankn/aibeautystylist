// Admin API: 聚合统计数据（Overview 大盘所需的全部 KPI）。
import type { APIRoute } from "astro";

import { checkAdmin } from "../../../lib/adminGuard";
import { apiError, apiSuccess } from "../../../lib/http";
import { PLAN_DEFINITIONS } from "../../../lib/plans";
import { getRuntimeBindings } from "../../../lib/runtime";

interface CountRow {
  cnt: number | string | null;
}
interface SumRow {
  total: number | string | null;
}

export const GET: APIRoute = async ({ cookies }) => {
  const { DB } = getRuntimeBindings();
  if (!DB)
    return apiError(
      { code: "DB_UNAVAILABLE", message: "数据库不可用", retryable: false },
      503,
    );

  const auth = await checkAdmin(cookies, DB);
  if (!auth.authorized) {
    return apiError(
      { code: "FORBIDDEN", message: "需要管理员权限", retryable: false },
      403,
    );
  }

  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();
  const weekAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const chartSince = new Date(
    now.getTime() - 14 * 24 * 60 * 60 * 1000,
  ).toISOString();

  // 并行查询所有统计数据
  const [
    totalUsers,
    activeUsersWeek,
    newUsersToday,
    newUsersWeek,
    subscriptionCounts,
    monthlyAiCost,
    monthlyAiCalls,
    aiSuccessRate,
    openTickets,
    avgAiDuration,
    recentTickets,
    recentUsers,
    dailyNewUsers,
    dailySubscriptionRevenue,
    dailyAiCost,
  ] = await Promise.all([
    // 总用户数
    DB.prepare(
      "SELECT COUNT(*) as cnt FROM users WHERE deleted_at IS NULL",
    ).first<CountRow>(),
    // 近 7 天有试妆行为的活跃用户
    DB.prepare(
      "SELECT COUNT(DISTINCT user_id) as cnt FROM tryon_jobs WHERE created_at >= ?",
    )
      .bind(weekAgo)
      .first<CountRow>(),
    // 今日新增
    DB.prepare(
      "SELECT COUNT(*) as cnt FROM users WHERE created_at >= ? AND deleted_at IS NULL",
    )
      .bind(dayAgo)
      .first<CountRow>(),
    // 本周新增
    DB.prepare(
      "SELECT COUNT(*) as cnt FROM users WHERE created_at >= ? AND deleted_at IS NULL",
    )
      .bind(weekAgo)
      .first<CountRow>(),
    // 每用户最高有效订阅（active / trialing / past_due / 未过期 canceled）
    DB.prepare(
      `
      WITH ranked_subscriptions AS (
        SELECT user_id, plan_code,
          ROW_NUMBER() OVER (
            PARTITION BY user_id
            ORDER BY CASE plan_code WHEN 'premium' THEN 3 WHEN 'pro' THEN 2 ELSE 1 END DESC, updated_at DESC
          ) as rn
        FROM subscriptions
        WHERE status IN ('active', 'trialing', 'past_due')
          OR (status = 'canceled' AND current_period_end IS NOT NULL AND current_period_end > ?)
      )
      SELECT
        COUNT(*) as active,
        COALESCE(SUM(CASE WHEN plan_code = 'pro' THEN 1 ELSE 0 END), 0) as pro,
        COALESCE(SUM(CASE WHEN plan_code = 'premium' THEN 1 ELSE 0 END), 0) as premium
      FROM ranked_subscriptions
      WHERE rn = 1
    `,
    )
      .bind(now.toISOString())
      .first<{
        active: number | string | null;
        pro: number | string | null;
        premium: number | string | null;
      }>(),
    // 本月 AI 计量成本：estimated_cost_micros 当前兼容美元 micros 与 provider credits micros。
    DB.prepare(
      "SELECT COALESCE(SUM(estimated_cost_micros), 0) as total FROM ai_call_logs WHERE created_at >= ?",
    )
      .bind(monthStart)
      .first<SumRow>(),
    // 本月 AI 调用总数
    DB.prepare("SELECT COUNT(*) as cnt FROM ai_call_logs WHERE created_at >= ?")
      .bind(monthStart)
      .first<CountRow>(),
    // AI 成功率
    DB.prepare(
      "SELECT CASE WHEN COUNT(*) = 0 THEN 100.0 ELSE ROUND(SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) END as total FROM ai_call_logs WHERE created_at >= ?",
    )
      .bind(monthStart)
      .first<SumRow>(),
    // 未解决工单
    DB.prepare(
      "SELECT COUNT(*) as cnt FROM support_requests WHERE status = 'open'",
    ).first<CountRow>(),
    // 平均 AI 响应时间
    DB.prepare(
      "SELECT ROUND(AVG(duration_ms), 0) as total FROM ai_call_logs WHERE created_at >= ? AND duration_ms IS NOT NULL",
    )
      .bind(monthStart)
      .first<SumRow>(),
    // 最近 5 条工单
    DB.prepare(
      "SELECT id, ticket_code, name, email, topic, status, created_at, updated_at FROM support_requests ORDER BY updated_at DESC LIMIT 5",
    ).all<{
      id: string;
      ticket_code: string;
      name: string;
      email: string;
      topic: string;
      status: string;
      created_at: string;
      updated_at: string;
    }>(),
    // 最近 10 个用户
    DB.prepare(
      `
      WITH ranked_subscriptions AS (
        SELECT user_id, plan_code, status,
          ROW_NUMBER() OVER (
            PARTITION BY user_id
            ORDER BY CASE plan_code WHEN 'premium' THEN 3 WHEN 'pro' THEN 2 ELSE 1 END DESC, updated_at DESC
          ) as rn
        FROM subscriptions
        WHERE status IN ('active', 'trialing', 'past_due')
          OR (status = 'canceled' AND current_period_end IS NOT NULL AND current_period_end > ?)
      )
      SELECT
        u.id,
        COALESCE(a.email, u.email, 'anonymous') as email,
        u.created_at,
        COALESCE(s.plan_code, 'free') as plan_code,
        COALESCE(s.status, 'none') as subscription_status,
        (SELECT COUNT(*) FROM tryon_jobs t WHERE t.user_id = u.id) as tryon_count,
        (SELECT MAX(t.created_at) FROM tryon_jobs t WHERE t.user_id = u.id) as last_tryon_at
      FROM users u
      LEFT JOIN auth_accounts a ON u.id = a.user_id
      LEFT JOIN ranked_subscriptions s ON u.id = s.user_id AND s.rn = 1
      WHERE u.deleted_at IS NULL
      ORDER BY u.created_at DESC
      LIMIT 10
    `,
    )
      .bind(now.toISOString())
      .all<{
        id: string;
        email: string;
        created_at: string;
        plan_code: string;
        subscription_status: string;
        tryon_count: number;
        last_tryon_at: string | null;
      }>(),
    // 最近 14 天每日新用户
    DB.prepare(
      "SELECT DATE(created_at) as day, COUNT(*) as cnt FROM users WHERE created_at >= ? AND deleted_at IS NULL GROUP BY DATE(created_at) ORDER BY day",
    )
      .bind(chartSince)
      .all<{ day: string; cnt: number }>(),
    // 最近 14 天新增订阅对应的月收入
    DB.prepare(
      `
      SELECT DATE(created_at) as day,
        COALESCE(SUM(CASE plan_code
          WHEN 'pro' THEN ?
          WHEN 'premium' THEN ?
          ELSE 0
        END), 0) as revenue_usd
      FROM subscriptions
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY day
    `,
    )
      .bind(
        PLAN_DEFINITIONS.pro.monthlyPriceUsd,
        PLAN_DEFINITIONS.premium.monthlyPriceUsd,
        chartSince,
      )
      .all<{ day: string; revenue_usd: number }>(),
    // 最近 14 天 AI 成本趋势
    DB.prepare(
      `
      SELECT DATE(created_at) as day,
        COALESCE(SUM(estimated_cost_micros), 0) as cost_micros
      FROM ai_call_logs
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY day
    `,
    )
      .bind(chartSince)
      .all<{ day: string; cost_micros: number }>(),
  ]);

  const aiCostMicros = Number(monthlyAiCost?.total ?? 0);
  const activeSubscriptions = Number(subscriptionCounts?.active ?? 0);
  const proSubscriptions = Number(subscriptionCounts?.pro ?? 0);
  const premiumSubscriptions = Number(subscriptionCounts?.premium ?? 0);
  const estimatedMrrUsd =
    proSubscriptions * PLAN_DEFINITIONS.pro.monthlyPriceUsd +
    premiumSubscriptions * PLAN_DEFINITIONS.premium.monthlyPriceUsd;

  return apiSuccess({
    generatedAt: now.toISOString(),
    period: {
      aiCostSince: monthStart,
      userGrowthDays: 14,
      newUsersSince: {
        day: dayAgo,
        week: weekAgo,
      },
    },
    totalUsers: Number(totalUsers?.cnt ?? 0),
    activeUsersWeek: Number(activeUsersWeek?.cnt ?? 0),
    newUsersToday: Number(newUsersToday?.cnt ?? 0),
    newUsersWeek: Number(newUsersWeek?.cnt ?? 0),
    activeSubscriptions,
    proSubscriptions,
    premiumSubscriptions,
    estimatedMrrUsd: Number(estimatedMrrUsd.toFixed(2)),
    monthlyAiCostUnits: Number((aiCostMicros / 1_000_000).toFixed(2)),
    monthlyAiCalls: Number(monthlyAiCalls?.cnt ?? 0),
    aiSuccessRate: Number(aiSuccessRate?.total ?? 100),
    openTickets: Number(openTickets?.cnt ?? 0),
    avgAiDurationMs: Number(avgAiDuration?.total ?? 0),
    recentTickets: recentTickets?.results ?? [],
    recentUsers: recentUsers?.results ?? [],
    dailyNewUsers: dailyNewUsers?.results ?? [],
    dailySubscriptionRevenue: dailySubscriptionRevenue?.results ?? [],
    dailyAiCost: (dailyAiCost?.results ?? []).map((row) => ({
      day: row.day,
      cost_units: Number((Number(row.cost_micros ?? 0) / 1_000_000).toFixed(2)),
    })),
  });
};
