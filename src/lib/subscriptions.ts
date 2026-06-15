import { isPlanCode, type PlanCode } from "./plans";
import type { D1DatabaseLike } from "./runtime";

// Stripe 订阅状态中视为「权益有效」的集合。
// canceled 由 current_period_end 决定是否仍在计费周期内保留权益。
const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

export interface StoredSubscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  planCode: PlanCode;
  status: string;
  currentPeriodEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSubscriptionInput {
  userId: string;
  stripeSubscriptionId: string;
  planCode: PlanCode;
  status: string;
  currentPeriodEnd?: string;
}

export interface EffectivePlan {
  planCode: PlanCode;
  source: "subscription" | "default";
  status?: string;
  currentPeriodEnd?: string;
}

interface SubscriptionRow {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  plan_code: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

const mockSubscriptions = new Map<string, StoredSubscription>();

// 当前生效计划：有有效付费订阅则返回其计划，否则回落 free。
// 「有效」= 状态属于活跃集合，或已取消但仍在 current_period_end 之前。
export async function getEffectivePlan(
  userId: string,
  DB?: D1DatabaseLike,
  now = new Date(),
): Promise<EffectivePlan> {
  const subscriptions = await listUserSubscriptions(userId, DB);
  const effective = subscriptions
    .filter((sub) => isEntitled(sub, now))
    .sort((a, b) => planRank(b.planCode) - planRank(a.planCode))[0];

  if (!effective) {
    return { planCode: "free", source: "default" };
  }
  return {
    planCode: effective.planCode,
    source: "subscription",
    status: effective.status,
    currentPeriodEnd: effective.currentPeriodEnd,
  };
}

export async function upsertSubscription(
  input: UpsertSubscriptionInput,
  DB?: D1DatabaseLike,
  now = new Date(),
): Promise<StoredSubscription> {
  const timestamp = now.toISOString();

  if (DB) {
    const existing = await DB.prepare(
      "SELECT id, user_id, stripe_subscription_id, plan_code, status, current_period_end, created_at, updated_at FROM subscriptions WHERE stripe_subscription_id = ?",
    )
      .bind(input.stripeSubscriptionId)
      .first<SubscriptionRow>();

    if (existing) {
      await DB.prepare(
        "UPDATE subscriptions SET user_id = ?, plan_code = ?, status = ?, current_period_end = ?, updated_at = ? WHERE stripe_subscription_id = ?",
      )
        .bind(
          input.userId,
          input.planCode,
          input.status,
          input.currentPeriodEnd ?? null,
          timestamp,
          input.stripeSubscriptionId,
        )
        .run();
      return {
        ...fromRow(existing),
        userId: input.userId,
        planCode: input.planCode,
        status: input.status,
        currentPeriodEnd: input.currentPeriodEnd,
        updatedAt: timestamp,
      };
    }

    await DB.prepare(
      "INSERT OR IGNORE INTO users (id, created_at) VALUES (?, ?)",
    )
      .bind(input.userId, timestamp)
      .run();
    const id = crypto.randomUUID();
    await DB.prepare(
      "INSERT INTO subscriptions (id, user_id, stripe_subscription_id, plan_code, status, current_period_end, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(
        id,
        input.userId,
        input.stripeSubscriptionId,
        input.planCode,
        input.status,
        input.currentPeriodEnd ?? null,
        timestamp,
        timestamp,
      )
      .run();
    return {
      id,
      userId: input.userId,
      stripeSubscriptionId: input.stripeSubscriptionId,
      planCode: input.planCode,
      status: input.status,
      currentPeriodEnd: input.currentPeriodEnd,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  const existing = mockSubscriptions.get(input.stripeSubscriptionId);
  const record: StoredSubscription = {
    id: existing?.id ?? crypto.randomUUID(),
    userId: input.userId,
    stripeSubscriptionId: input.stripeSubscriptionId,
    planCode: input.planCode,
    status: input.status,
    currentPeriodEnd: input.currentPeriodEnd,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  mockSubscriptions.set(input.stripeSubscriptionId, record);
  return record;
}

export async function listUserSubscriptions(
  userId: string,
  DB?: D1DatabaseLike,
): Promise<StoredSubscription[]> {
  if (DB) {
    const rows = await DB.prepare(
      "SELECT id, user_id, stripe_subscription_id, plan_code, status, current_period_end, created_at, updated_at FROM subscriptions WHERE user_id = ?",
    )
      .bind(userId)
      .all<SubscriptionRow>();
    return (rows.results ?? []).map(fromRow);
  }

  return [...mockSubscriptions.values()].filter((sub) => sub.userId === userId);
}

export function resetMockSubscriptions(): void {
  mockSubscriptions.clear();
  mockCustomers.clear();
}

const mockCustomers = new Map<string, string>();

// 记录 用户 ↔ Stripe customer 映射（用于 Billing Portal 与复购复用 customer）。
export async function saveStripeCustomer(
  userId: string,
  stripeCustomerId: string,
  DB?: D1DatabaseLike,
  now = new Date(),
): Promise<void> {
  const timestamp = now.toISOString();
  if (DB) {
    await DB.prepare(
      "INSERT OR IGNORE INTO users (id, created_at) VALUES (?, ?)",
    )
      .bind(userId, timestamp)
      .run();
    await DB.prepare(
      "INSERT INTO stripe_customers (user_id, stripe_customer_id, created_at, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET stripe_customer_id = excluded.stripe_customer_id, updated_at = excluded.updated_at",
    )
      .bind(userId, stripeCustomerId, timestamp, timestamp)
      .run();
    return;
  }
  mockCustomers.set(userId, stripeCustomerId);
}

export async function getStripeCustomerId(
  userId: string,
  DB?: D1DatabaseLike,
): Promise<string | undefined> {
  if (DB) {
    const row = await DB.prepare(
      "SELECT stripe_customer_id FROM stripe_customers WHERE user_id = ?",
    )
      .bind(userId)
      .first<{ stripe_customer_id: string }>();
    return row?.stripe_customer_id ?? undefined;
  }
  return mockCustomers.get(userId);
}

function isEntitled(sub: StoredSubscription, now: Date): boolean {
  if (ACTIVE_STATUSES.has(sub.status)) return true;
  // 已取消/到期状态：仍在已付费周期内则保留权益。
  if (sub.status === "canceled" && sub.currentPeriodEnd) {
    return new Date(sub.currentPeriodEnd).getTime() > now.getTime();
  }
  return false;
}

function planRank(code: PlanCode): number {
  return code === "premium" ? 3 : code === "pro" ? 2 : 1;
}

function fromRow(row: SubscriptionRow): StoredSubscription {
  return {
    id: row.id,
    userId: row.user_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    planCode: isPlanCode(row.plan_code) ? row.plan_code : "free",
    status: row.status,
    currentPeriodEnd: row.current_period_end ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
