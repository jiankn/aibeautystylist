import { getMonthlyQuota, getPlanRank, type PlanCode } from "./plans";
import type { D1DatabaseLike } from "./runtime";

export const FREE_MONTHLY_QUOTA = 3;

export interface QuotaSnapshot {
  remaining: number;
  total: number;
  used: number;
  periodStart: string;
  nextRefreshAt: string;
  /** 额度包剩余额度（会员期间持续有效，不随计费周期重置） */
  packRemaining: number;
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
  monthly_balance: number | string | null;
  share_bonus: number | string | null;
  pack_balance: number | string | null;
  pack_granted: number | string | null;
}

interface ExistingUsageRow {
  id: string;
}

interface MockUsageRecord {
  amount: number;
  type: string;
  jobId: string;
  idempotencyKey: string;
  occurredAt: string;
}

const mockUsage = new Map<string, MockUsageRecord[]>();

/** 额度包相关的 usage 类型集合 */
const PACK_TYPES = new Set(["credit_pack", "reserve_pack", "refund_pack"]);

export async function getQuotaSnapshot(
  userId: string,
  DB?: D1DatabaseLike,
  now = new Date(),
  monthlyQuota: number = FREE_MONTHLY_QUOTA,
  quotaPeriod?: QuotaPeriodInput,
): Promise<QuotaSnapshot> {
  const { periodStart, nextRefreshAt } = resolveQuotaPeriod(now, quotaPeriod);
  let monthlyBalance = 0;
  let shareBonus = 0;
  let packBalance = 0;
  let packGranted = 0;

  if (DB) {
    // 月度记录按当前周期筛选，额度包记录不限周期（会员期间持续有效）
    const row = await DB.prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN type NOT IN ('credit_pack','reserve_pack','refund_pack') AND occurred_at >= ? THEN amount ELSE 0 END), 0) AS monthly_balance,
        COALESCE(SUM(CASE WHEN type = 'share_reward' AND occurred_at >= ? THEN amount ELSE 0 END), 0) AS share_bonus,
        COALESCE(SUM(CASE WHEN type IN ('credit_pack','reserve_pack','refund_pack') THEN amount ELSE 0 END), 0) AS pack_balance,
        COALESCE(SUM(CASE WHEN type = 'credit_pack' THEN amount ELSE 0 END), 0) AS pack_granted
      FROM usage_records WHERE user_id = ?`,
    )
      .bind(periodStart, periodStart, userId)
      .first<UsageBalanceRow>();
    monthlyBalance = Number(row?.monthly_balance ?? 0);
    shareBonus = Number(row?.share_bonus ?? 0);
    packBalance = Number(row?.pack_balance ?? 0);
    packGranted = Number(row?.pack_granted ?? 0);
  } else {
    const allRecords = mockUsage.get(userId) ?? [];
    for (const record of allRecords) {
      if (PACK_TYPES.has(record.type)) {
        // 额度包记录：不限周期
        packBalance += record.amount;
        if (record.type === "credit_pack") packGranted += record.amount;
      } else if (record.occurredAt >= periodStart) {
        // 月度记录：当前周期内
        monthlyBalance += record.amount;
        if (record.type === "share_reward") shareBonus += record.amount;
      }
    }
  }

  const monthlyRemaining = Math.max(0, monthlyQuota + monthlyBalance);
  const packRemaining = Math.max(0, packBalance);
  const remaining = monthlyRemaining + packRemaining;
  const total = monthlyQuota + Math.max(0, shareBonus) + Math.max(0, packGranted);
  return {
    remaining,
    total,
    used: Math.max(0, total - remaining),
    periodStart,
    nextRefreshAt,
    packRemaining,
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

  // 幂等检查：同一 reserve key 下的额度包变体也算重复
  const packUsageKey = `reserve_pack:${userId}:${idempotencyKey}`;
  if (
    (await hasUsageRecord(userId, usageKey, DB)) ||
    (await hasUsageRecord(userId, packUsageKey, DB))
  ) {
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

  // 先消耗月度额度；月度用完后再消耗额度包额度
  const monthlyRemaining = before.remaining - before.packRemaining;
  if (monthlyRemaining > 0) {
    await appendUsageRecord(userId, jobId, "reserve", -1, usageKey, DB, now);
  } else {
    await appendUsageRecord(
      userId,
      jobId,
      "reserve_pack",
      -1,
      packUsageKey,
      DB,
      now,
    );
  }
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
  const packUsageKey = `refund_pack:${userId}:${jobId}`;
  if (
    !(await hasUsageRecord(userId, usageKey, DB)) &&
    !(await hasUsageRecord(userId, packUsageKey, DB))
  ) {
    // 查找原始 reserve 记录类型，决定退回到哪个池
    const wasPackReserve = await hasOriginalPackReserve(userId, jobId, DB);
    if (wasPackReserve) {
      await appendUsageRecord(
        userId,
        jobId,
        "refund_pack",
        1,
        packUsageKey,
        DB,
        now,
      );
    } else {
      await appendUsageRecord(userId, jobId, "refund", 1, usageKey, DB, now);
    }
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

type UsageRecordType =
  | "reserve"
  | "reserve_pack"
  | "refund"
  | "refund_pack"
  | "share_reward"
  | "plan_reset"
  | "credit_pack";

async function appendUsageRecord(
  userId: string,
  jobId: string,
  type: UsageRecordType,
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
  records.push({ amount, type, jobId, idempotencyKey, occurredAt });
  mockUsage.set(userId, records);
  return true;
}

/** 检查指定 jobId 的原始预留是否消耗了额度包额度 */
async function hasOriginalPackReserve(
  userId: string,
  jobId: string,
  DB?: D1DatabaseLike,
): Promise<boolean> {
  if (DB) {
    const row = await DB.prepare(
      "SELECT id FROM usage_records WHERE user_id = ? AND job_id = ? AND type = 'reserve_pack' LIMIT 1",
    )
      .bind(userId, jobId)
      .first<ExistingUsageRow>();
    return Boolean(row);
  }
  return (mockUsage.get(userId) ?? []).some(
    (record) => record.type === "reserve_pack" && record.jobId === jobId,
  );
}
