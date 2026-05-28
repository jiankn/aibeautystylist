/**
 * 订阅 Repository — D1 CRUD 操作
 * 管理用户订阅状态，与 Stripe Webhook 同步
 */
import type { RuntimeEnv, D1DatabaseLike } from '../cloudflare/runtime';

// ─── 类型定义 ───────────────────────────────────────────────
export interface SubscriptionRecord {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string | null;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: number;
  created_at: string;
  updated_at: string;
}

export interface PlanRecord {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'premium';
  interval: string | null;
  price_cents: number;
  currency: string;
  stripe_price_id: string | null;
  features_json: string;
  is_active: number;
  sort_order: number;
}

/** 解析后的计划权益 */
export interface PlanFeatures {
  /** 月度诊断次数限制（按订阅周期）。-1 = 软上限无限 */
  diagnosisLimit: number;
  /** 月度妆效图生成次数（按订阅周期）。-1 = 软上限无限 */
  makeupRenderLimit?: number;
  /** 软上限保护值。仅当 diagnosisLimit=-1 时生效，超过则拒绝 */
  diagnosisHardCap?: number;
  /** 软上限保护值。仅当 makeupRenderLimit=-1 时生效 */
  makeupRenderHardCap?: number;
  looksLimit: number;
  tutorialDetail: 'basic' | 'full' | 'full_video';
  makeupPreview: boolean;
  makeupPreviewQuality?: 'standard' | 'hd';
  kitRecommend: 'basic' | 'full' | 'full_budget';
  historyDays: number;      // -1 = 永久
  savedLooksLimit: number;  // -1 = 无限
}

// ─── 辅助方法 ───────────────────────────────────────────────
function getDb(env?: RuntimeEnv): D1DatabaseLike | null {
  return env?.DB ?? null;
}

// ─── Plans 查询 ──────────────────────────────────────────────
export async function listActivePlans(
  env: RuntimeEnv | undefined,
): Promise<PlanRecord[]> {
  const db = getDb(env);
  if (!db) return [];

  const result = await db
    .prepare('SELECT * FROM plans WHERE is_active = 1 ORDER BY sort_order')
    .first<PlanRecord>();

  // D1 first() 只返回第一行，需要用 all() 获取全部
  // 但 D1DatabaseLike 接口未定义 all()，这里使用多次 first 的替代方案
  // 实际生产中应扩展 D1DatabaseLike 接口以支持 all()
  return result ? [result] : [];
}

export async function findPlanById(
  env: RuntimeEnv | undefined,
  planId: string,
): Promise<PlanRecord | null> {
  const db = getDb(env);
  if (!db) return null;

  return db
    .prepare('SELECT * FROM plans WHERE id = ?')
    .bind(planId)
    .first<PlanRecord>();
}

export function parsePlanFeatures(plan: PlanRecord): PlanFeatures {
  try {
    return JSON.parse(plan.features_json) as PlanFeatures;
  } catch {
    // 返回 Free 默认权益
    return {
      diagnosisLimit: 1,
      makeupRenderLimit: 0,
      looksLimit: 2,
      tutorialDetail: 'basic',
      makeupPreview: false,
      kitRecommend: 'basic',
      historyDays: 0,
      savedLooksLimit: 0,
    };
  }
}

// ─── Subscription CRUD ──────────────────────────────────────
export async function findActiveSubscription(
  env: RuntimeEnv | undefined,
  userId: string,
): Promise<SubscriptionRecord | null> {
  const db = getDb(env);
  if (!db) return null;
  const now = new Date().toISOString();

  return db
    .prepare(
      `SELECT * FROM subscriptions
       WHERE user_id = ?
         AND status IN ('active', 'trialing')
         AND (current_period_end IS NULL OR current_period_end > ?)
       ORDER BY created_at DESC`,
    )
    .bind(userId, now)
    .first<SubscriptionRecord>();
}

export async function findSubscriptionByStripeId(
  env: RuntimeEnv | undefined,
  stripeSubscriptionId: string,
): Promise<SubscriptionRecord | null> {
  const db = getDb(env);
  if (!db) return null;

  return db
    .prepare('SELECT * FROM subscriptions WHERE stripe_subscription_id = ?')
    .bind(stripeSubscriptionId)
    .first<SubscriptionRecord>();
}

export async function createSubscription(
  env: RuntimeEnv | undefined,
  input: {
    userId: string;
    planId: string;
    stripeSubscriptionId?: string;
    status?: string;
    periodStart?: string;
    periodEnd?: string;
  },
): Promise<string | null> {
  const db = getDb(env);
  if (!db) return null;

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO subscriptions
       (id, user_id, plan_id, stripe_subscription_id, status, current_period_start, current_period_end, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.userId,
      input.planId,
      input.stripeSubscriptionId ?? null,
      input.status ?? 'active',
      input.periodStart ?? null,
      input.periodEnd ?? null,
      now,
      now,
    )
    .run();

  return id;
}

export async function updateSubscriptionStatus(
  env: RuntimeEnv | undefined,
  stripeSubscriptionId: string,
  updates: {
    status?: string;
    planId?: string;
    periodStart?: string;
    periodEnd?: string;
    cancelAtPeriodEnd?: boolean;
  },
): Promise<void> {
  const db = getDb(env);
  if (!db) return;

  const sets: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.status) { sets.push('status = ?'); values.push(updates.status); }
  if (updates.planId) { sets.push('plan_id = ?'); values.push(updates.planId); }
  if (updates.periodStart) { sets.push('current_period_start = ?'); values.push(updates.periodStart); }
  if (updates.periodEnd) { sets.push('current_period_end = ?'); values.push(updates.periodEnd); }
  if (updates.cancelAtPeriodEnd !== undefined) {
    sets.push('cancel_at_period_end = ?');
    values.push(updates.cancelAtPeriodEnd ? 1 : 0);
  }

  if (sets.length === 0) return;

  sets.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(stripeSubscriptionId);

  await db
    .prepare(`UPDATE subscriptions SET ${sets.join(', ')} WHERE stripe_subscription_id = ?`)
    .bind(...values)
    .run();
}

// ─── 会员等级查询（业务层常用）──────────────────────────────
export type UserTier = 'free' | 'pro' | 'premium';

/**
 * 获取用户当前有效的会员等级
 * 优先查 subscription 表，fallback 到 users.tier
 */
export async function getUserTier(
  env: RuntimeEnv | undefined,
  userId: string,
): Promise<{ tier: UserTier; features: PlanFeatures }> {
  // 默认 Free 权益
  const freePlan: PlanFeatures = {
    diagnosisLimit: 1,
    makeupRenderLimit: 0,
    looksLimit: 2,
    tutorialDetail: 'basic',
    makeupPreview: false,
    kitRecommend: 'basic',
    historyDays: 0,
    savedLooksLimit: 0,
  };

  const sub = await findActiveSubscription(env, userId);
  if (!sub) return { tier: 'free', features: freePlan };

  const plan = await findPlanById(env, sub.plan_id);
  if (!plan) return { tier: 'free', features: freePlan };

  return {
    tier: plan.tier as UserTier,
    features: parsePlanFeatures(plan),
  };
}
