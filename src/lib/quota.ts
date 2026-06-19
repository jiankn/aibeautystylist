import { getMonthlyQuota, getPlanRank, type PlanCode } from "./plans";
import type { D1DatabaseLike } from "./runtime";

export const FREE_MONTHLY_QUOTA = 3;

export interface QuotaSnapshot {
  remaining: number;
  total: number;
  used: number;
  periodStart: string;
  nextRefreshAt: string;
}

export interface QuotaReservation {
  reserved: boolean;
  duplicate: boolean;
  snapshot: QuotaSnapshot;
}

export interface ShareRewardGrant {
  rewarded: boolean;
  duplicate: boolean;
  snapshot: QuotaSnapshot;
}

export interface PlanQuotaReset {
  reset: boolean;
  duplicate: boolean;
  amount: number;
  snapshot: QuotaSnapshot;
}

interface UsageBalanceRow {
  balance_change: number | string | null;
}

interface ExistingUsageRow {
  id: string;
}

interface MockUsageRecord {
  amount: number;
  idempotencyKey: string;
  occurredAt: string;
}

const mockUsage = new Map<string, MockUsageRecord[]>();

export async function getQuotaSnapshot(
  userId: string,
  DB?: D1DatabaseLike,
  now = new Date(),
  monthlyQuota: number = FREE_MONTHLY_QUOTA,
): Promise<QuotaSnapshot> {
  const periodStart = getUtcMonthStart(now);
  const nextRefreshAt = getNextUtcMonthStart(now);
  let balanceChange = 0;

  if (DB) {
    const row = await DB.prepare(
      "SELECT COALESCE(SUM(amount), 0) AS balance_change FROM usage_records WHERE user_id = ? AND occurred_at >= ?",
    )
      .bind(userId, periodStart)
      .first<UsageBalanceRow>();
    balanceChange = Number(row?.balance_change ?? 0);
  } else {
    balanceChange = (mockUsage.get(userId) ?? [])
      .filter((record) => record.occurredAt >= periodStart)
      .reduce((total, record) => total + record.amount, 0);
  }

  const remaining = Math.max(0, monthlyQuota + balanceChange);
  return {
    remaining,
    total: monthlyQuota,
    used: Math.max(0, monthlyQuota - remaining),
    periodStart,
    nextRefreshAt,
  };
}

export async function reserveQuota(
  userId: string,
  jobId: string,
  idempotencyKey: string,
  DB?: D1DatabaseLike,
  now = new Date(),
  monthlyQuota: number = FREE_MONTHLY_QUOTA,
): Promise<QuotaReservation> {
  const usageKey = `reserve:${userId}:${idempotencyKey}`;

  if (await hasUsageRecord(userId, usageKey, DB)) {
    return {
      reserved: false,
      duplicate: true,
      snapshot: await getQuotaSnapshot(userId, DB, now, monthlyQuota),
    };
  }

  const before = await getQuotaSnapshot(userId, DB, now, monthlyQuota);
  if (before.remaining <= 0) {
    return { reserved: false, duplicate: false, snapshot: before };
  }

  await appendUsageRecord(userId, jobId, "reserve", -1, usageKey, DB, now);
  return {
    reserved: true,
    duplicate: false,
    snapshot: await getQuotaSnapshot(userId, DB, now, monthlyQuota),
  };
}

export async function refundQuota(
  userId: string,
  jobId: string,
  DB?: D1DatabaseLike,
  now = new Date(),
  monthlyQuota: number = FREE_MONTHLY_QUOTA,
): Promise<QuotaSnapshot> {
  const usageKey = `refund:${userId}:${jobId}`;
  if (!(await hasUsageRecord(userId, usageKey, DB))) {
    await appendUsageRecord(userId, jobId, "refund", 1, usageKey, DB, now);
  }
  return getQuotaSnapshot(userId, DB, now, monthlyQuota);
}

export async function grantShareReward(
  userId: string,
  jobId: string,
  DB?: D1DatabaseLike,
  now = new Date(),
  monthlyQuota: number = FREE_MONTHLY_QUOTA,
): Promise<ShareRewardGrant> {
  const rewardDate = now.toISOString().slice(0, 10);
  const usageKey = `share_reward:${userId}:${rewardDate}`;

  if (await hasUsageRecord(userId, usageKey, DB)) {
    return {
      rewarded: false,
      duplicate: true,
      snapshot: await getQuotaSnapshot(userId, DB, now, monthlyQuota),
    };
  }

  await appendUsageRecord(userId, jobId, "share_reward", 1, usageKey, DB, now);
  return {
    rewarded: true,
    duplicate: false,
    snapshot: await getQuotaSnapshot(userId, DB, now, monthlyQuota),
  };
}

export async function resetQuotaForPlanUpgrade(input: {
  userId: string;
  fromPlanCode: PlanCode;
  toPlanCode: PlanCode;
  sourceId: string;
  DB?: D1DatabaseLike;
  now?: Date;
  allowSamePlan?: boolean;
}): Promise<PlanQuotaReset> {
  const now = input.now ?? new Date();
  const monthlyQuota = getMonthlyQuota(input.toPlanCode);
  const before = await getQuotaSnapshot(
    input.userId,
    input.DB,
    now,
    monthlyQuota,
  );

  const isUpgrade =
    getPlanRank(input.toPlanCode) > getPlanRank(input.fromPlanCode);
  if (!isUpgrade && !input.allowSamePlan) {
    return { reset: false, duplicate: false, amount: 0, snapshot: before };
  }

  const usageKey = [
    "plan_reset",
    input.userId,
    input.sourceId,
    input.toPlanCode,
    before.periodStart,
  ].join(":");

  if (await hasUsageRecord(input.userId, usageKey, input.DB)) {
    return { reset: false, duplicate: true, amount: 0, snapshot: before };
  }

  const amount = Math.max(0, before.total - before.remaining);
  await appendUsageRecord(
    input.userId,
    input.sourceId,
    "plan_reset",
    amount,
    usageKey,
    input.DB,
    now,
  );

  return {
    reset: amount > 0,
    duplicate: false,
    amount,
    snapshot: await getQuotaSnapshot(input.userId, input.DB, now, monthlyQuota),
  };
}

export function resetMockQuota(): void {
  mockUsage.clear();
}

export function getUtcMonthStart(now = new Date()): string {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();
}

export function getNextUtcMonthStart(now = new Date()): string {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  ).toISOString();
}

async function hasUsageRecord(
  userId: string,
  idempotencyKey: string,
  DB?: D1DatabaseLike,
): Promise<boolean> {
  if (DB) {
    const row = await DB.prepare(
      "SELECT id FROM usage_records WHERE user_id = ? AND idempotency_key = ?",
    )
      .bind(userId, idempotencyKey)
      .first<ExistingUsageRow>();
    return Boolean(row);
  }

  return (mockUsage.get(userId) ?? []).some(
    (record) => record.idempotencyKey === idempotencyKey,
  );
}

async function appendUsageRecord(
  userId: string,
  jobId: string,
  type: "reserve" | "refund" | "share_reward" | "plan_reset",
  amount: number,
  idempotencyKey: string,
  DB?: D1DatabaseLike,
  now = new Date(),
): Promise<void> {
  const occurredAt = now.toISOString();

  if (DB) {
    await DB.prepare(
      "INSERT OR IGNORE INTO users (id, created_at) VALUES (?, ?)",
    )
      .bind(userId, occurredAt)
      .run();
    await DB.prepare(
      "INSERT INTO usage_records (id, user_id, job_id, type, amount, idempotency_key, occurred_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(
        crypto.randomUUID(),
        userId,
        jobId,
        type,
        amount,
        idempotencyKey,
        occurredAt,
      )
      .run();
    return;
  }

  const records = mockUsage.get(userId) ?? [];
  records.push({ amount, idempotencyKey, occurredAt });
  mockUsage.set(userId, records);
}
