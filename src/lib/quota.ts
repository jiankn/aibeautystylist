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

export interface QuotaPeriodInput {
  start?: string;
  end?: string;
}

interface ResolvedQuotaPeriod {
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

export interface CreditPackGrant {
  granted: boolean;
  duplicate: boolean;
  amount: number;
  snapshot: QuotaSnapshot;
}

interface UsageBalanceRow {
  balance_change: number | string | null;
  bonus_credits: number | string | null;
}

interface ExistingUsageRow {
  id: string;
}

interface MockUsageRecord {
  amount: number;
  type: string;
  idempotencyKey: string;
  occurredAt: string;
}

const mockUsage = new Map<string, MockUsageRecord[]>();

export async function getQuotaSnapshot(
  userId: string,
  DB?: D1DatabaseLike,
  now = new Date(),
  monthlyQuota: number = FREE_MONTHLY_QUOTA,
  quotaPeriod?: QuotaPeriodInput,
): Promise<QuotaSnapshot> {
  const { periodStart, nextRefreshAt } = resolveQuotaPeriod(now, quotaPeriod);
  let balanceChange = 0;
  let bonusCredits = 0;

  if (DB) {
    const row = await DB.prepare(
      "SELECT COALESCE(SUM(amount), 0) AS balance_change, COALESCE(SUM(CASE WHEN type IN ('share_reward', 'credit_pack') THEN amount ELSE 0 END), 0) AS bonus_credits FROM usage_records WHERE user_id = ? AND occurred_at >= ?",
    )
      .bind(userId, periodStart)
      .first<UsageBalanceRow>();
    balanceChange = Number(row?.balance_change ?? 0);
    bonusCredits = Number(row?.bonus_credits ?? 0);
  } else {
    const periodRecords = (mockUsage.get(userId) ?? []).filter(
      (record) => record.occurredAt >= periodStart,
    );
    balanceChange = periodRecords.reduce(
      (total, record) => total + record.amount,
      0,
    );
    bonusCredits = periodRecords
      .filter(
        (record) =>
          record.type === "share_reward" || record.type === "credit_pack",
      )
      .reduce((total, record) => total + record.amount, 0);
  }

  const remaining = Math.max(0, monthlyQuota + balanceChange);
  const total = monthlyQuota + Math.max(0, bonusCredits);
  return {
    remaining,
    total,
    used: Math.max(0, total - remaining),
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
  quotaPeriod?: QuotaPeriodInput,
): Promise<QuotaReservation> {
  const usageKey = `reserve:${userId}:${idempotencyKey}`;

  if (await hasUsageRecord(userId, usageKey, DB)) {
    return {
      reserved: false,
      duplicate: true,
      snapshot: await getQuotaSnapshot(
        userId,
        DB,
        now,
        monthlyQuota,
        quotaPeriod,
      ),
    };
  }

  const before = await getQuotaSnapshot(
    userId,
    DB,
    now,
    monthlyQuota,
    quotaPeriod,
  );
  if (before.remaining <= 0) {
    return { reserved: false, duplicate: false, snapshot: before };
  }

  await appendUsageRecord(userId, jobId, "reserve", -1, usageKey, DB, now);
  return {
    reserved: true,
    duplicate: false,
    snapshot: await getQuotaSnapshot(
      userId,
      DB,
      now,
      monthlyQuota,
      quotaPeriod,
    ),
  };
}

export async function refundQuota(
  userId: string,
  jobId: string,
  DB?: D1DatabaseLike,
  now = new Date(),
  monthlyQuota: number = FREE_MONTHLY_QUOTA,
  quotaPeriod?: QuotaPeriodInput,
): Promise<QuotaSnapshot> {
  const usageKey = `refund:${userId}:${jobId}`;
  if (!(await hasUsageRecord(userId, usageKey, DB))) {
    await appendUsageRecord(userId, jobId, "refund", 1, usageKey, DB, now);
  }
  return getQuotaSnapshot(userId, DB, now, monthlyQuota, quotaPeriod);
}

export async function grantShareReward(
  userId: string,
  jobId: string,
  DB?: D1DatabaseLike,
  now = new Date(),
  monthlyQuota: number = FREE_MONTHLY_QUOTA,
  quotaPeriod?: QuotaPeriodInput,
): Promise<ShareRewardGrant> {
  const rewardDate = now.toISOString().slice(0, 10);
  const usageKey = `share_reward:${userId}:${rewardDate}`;

  if (await hasUsageRecord(userId, usageKey, DB)) {
    return {
      rewarded: false,
      duplicate: true,
      snapshot: await getQuotaSnapshot(
        userId,
        DB,
        now,
        monthlyQuota,
        quotaPeriod,
      ),
    };
  }

  const inserted = await appendUsageRecord(
    userId,
    jobId,
    "share_reward",
    1,
    usageKey,
    DB,
    now,
    true,
  );
  if (!inserted) {
    return {
      rewarded: false,
      duplicate: true,
      snapshot: await getQuotaSnapshot(
        userId,
        DB,
        now,
        monthlyQuota,
        quotaPeriod,
      ),
    };
  }
  return {
    rewarded: true,
    duplicate: false,
    snapshot: await getQuotaSnapshot(
      userId,
      DB,
      now,
      monthlyQuota,
      quotaPeriod,
    ),
  };
}

export async function grantCreditPack(input: {
  userId: string;
  checkoutSessionId: string;
  credits: number;
  DB?: D1DatabaseLike;
  now?: Date;
  monthlyQuota: number;
  quotaPeriod?: QuotaPeriodInput;
}): Promise<CreditPackGrant> {
  const now = input.now ?? new Date();
  const credits = Math.max(0, Math.floor(input.credits));
  const usageKey = `credit_pack:${input.userId}:${input.checkoutSessionId}`;
  const inserted =
    credits > 0
      ? await appendUsageRecord(
          input.userId,
          input.checkoutSessionId,
          "credit_pack",
          credits,
          usageKey,
          input.DB,
          now,
          true,
        )
      : false;
  return {
    granted: inserted,
    duplicate: credits > 0 && !inserted,
    amount: inserted ? credits : 0,
    snapshot: await getQuotaSnapshot(
      input.userId,
      input.DB,
      now,
      input.monthlyQuota,
      input.quotaPeriod,
    ),
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
  quotaPeriod?: QuotaPeriodInput;
}): Promise<PlanQuotaReset> {
  const now = input.now ?? new Date();
  const monthlyQuota = getMonthlyQuota(input.toPlanCode);
  const before = await getQuotaSnapshot(
    input.userId,
    input.DB,
    now,
    monthlyQuota,
    input.quotaPeriod,
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
    snapshot: await getQuotaSnapshot(
      input.userId,
      input.DB,
      now,
      monthlyQuota,
      input.quotaPeriod,
    ),
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

export function resolveQuotaPeriod(
  now = new Date(),
  quotaPeriod?: QuotaPeriodInput,
): ResolvedQuotaPeriod {
  const explicitStart = parseIsoDate(quotaPeriod?.start);
  const explicitEnd = parseIsoDate(quotaPeriod?.end);

  if (
    explicitStart &&
    explicitEnd &&
    explicitEnd.getTime() > explicitStart.getTime() &&
    now.getTime() >= explicitStart.getTime() &&
    now.getTime() < explicitEnd.getTime()
  ) {
    return {
      periodStart: explicitStart.toISOString(),
      nextRefreshAt: explicitEnd.toISOString(),
    };
  }

  if (explicitEnd) {
    return inferMonthlyQuotaPeriodFromEnd(explicitEnd, now);
  }

  return {
    periodStart: getUtcMonthStart(now),
    nextRefreshAt: getNextUtcMonthStart(now),
  };
}

function inferMonthlyQuotaPeriodFromEnd(
  anchorEnd: Date,
  now: Date,
): ResolvedQuotaPeriod {
  let nextRefresh = anchorEnd;
  while (nextRefresh.getTime() <= now.getTime()) {
    nextRefresh = addUtcMonthsClamped(nextRefresh, 1);
  }
  while (addUtcMonthsClamped(nextRefresh, -1).getTime() > now.getTime()) {
    nextRefresh = addUtcMonthsClamped(nextRefresh, -1);
  }

  return {
    periodStart: addUtcMonthsClamped(nextRefresh, -1).toISOString(),
    nextRefreshAt: nextRefresh.toISOString(),
  };
}

function addUtcMonthsClamped(date: Date, months: number): Date {
  const firstOfTarget = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1),
  );
  const targetYear = firstOfTarget.getUTCFullYear();
  const targetMonth = firstOfTarget.getUTCMonth();
  const targetDay = Math.min(
    date.getUTCDate(),
    daysInUtcMonth(targetYear, targetMonth),
  );

  return new Date(
    Date.UTC(
      targetYear,
      targetMonth,
      targetDay,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );
}

function daysInUtcMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function parseIsoDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : undefined;
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
  type: "reserve" | "refund" | "share_reward" | "plan_reset" | "credit_pack",
  amount: number,
  idempotencyKey: string,
  DB?: D1DatabaseLike,
  now = new Date(),
  ignoreDuplicate = false,
): Promise<boolean> {
  const occurredAt = now.toISOString();

  if (DB) {
    await DB.prepare(
      "INSERT OR IGNORE INTO users (id, created_at) VALUES (?, ?)",
    )
      .bind(userId, occurredAt)
      .run();
    const result = (await DB.prepare(
      `${ignoreDuplicate ? "INSERT OR IGNORE" : "INSERT"} INTO usage_records (id, user_id, job_id, type, amount, idempotency_key, occurred_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
      .run()) as { meta?: { changes?: number } } | undefined;
    return result?.meta?.changes === 0 ? false : true;
  }

  const records = mockUsage.get(userId) ?? [];
  if (
    ignoreDuplicate &&
    records.some((record) => record.idempotencyKey === idempotencyKey)
  ) {
    return false;
  }
  records.push({ amount, type, idempotencyKey, occurredAt });
  mockUsage.set(userId, records);
  return true;
}
