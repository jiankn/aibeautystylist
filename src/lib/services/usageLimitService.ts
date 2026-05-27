/**
 * 用量计数服务
 *
 * 支持两种计费周期：
 * - 'daily': 按 UTC 日重置（适合 Free 用户的每日配额）
 * - 'monthly': 按 UTC 月重置（适合 Pro/Premium 用户的月度配额）
 *
 * 支持多种 actionType：
 * - 'tryon_diagnosis': AI 诊断
 * - 'makeup_render': 妆效预览图生成
 *
 * 存储优先级：USAGE_LIMITS KV → SESSION KV → D1 → 内存（仅 dev）
 */
import type { D1DatabaseLike, KVNamespaceLike, RuntimeEnv } from '../cloudflare/runtime';

export type UsageWindow = 'daily' | 'monthly';
export type ActionType = 'tryon_diagnosis' | 'makeup_render';

export interface UsageState {
  limit: number;
  count: number;
  remaining: number;
  source: 'kv' | 'd1' | 'memory';
  window: UsageWindow;
}

interface UsageInput {
  env?: RuntimeEnv;
  ipAddress: string;
  userId?: string | null;
  actionType?: ActionType;
  /** 上限（-1 = 无限，配合 hardCap 使用） */
  limit?: number;
  /** 软上限保护值，仅当 limit=-1 时生效 */
  hardCap?: number;
  /** 计费周期，默认 'daily' */
  window?: UsageWindow;
  now?: Date;
}

const memoryUsage = new Map<string, number>();
const DEFAULT_ACTION: ActionType = 'tryon_diagnosis';
const DEFAULT_LIMIT = 3;
// 月度 KV TTL：35 天，留 5 天 buffer
const TTL_MONTH_SECONDS = 60 * 60 * 24 * 35;
// 日 KV TTL：48 小时
const TTL_DAY_SECONDS = 60 * 60 * 48;

function periodKey(now: Date, window: UsageWindow): string {
  if (window === 'monthly') {
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  }
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

function periodStartIso(now: Date, window: UsageWindow): string {
  if (window === 'monthly') {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  }
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

function getKv(env?: RuntimeEnv): KVNamespaceLike | undefined {
  return env?.USAGE_LIMITS ?? env?.SESSION;
}

/**
 * 主体优先用 userId（已登录），fallback 到 ip（匿名）
 * 这样 Pro 用户切 IP 不会重置配额
 */
function getSubject(input: UsageInput): string {
  return input.userId ? `u:${input.userId}` : `ip:${input.ipAddress}`;
}

function getKey(input: UsageInput): string {
  const window = input.window ?? 'daily';
  const action = input.actionType ?? DEFAULT_ACTION;
  return `usage:${action}:${window}:${periodKey(input.now ?? new Date(), window)}:${getSubject(input)}`;
}

async function countFromD1(db: D1DatabaseLike, input: UsageInput): Promise<number> {
  const window = input.window ?? 'daily';
  const subjectColumn = input.userId ? 'user_id' : 'ip_address';
  const subjectValue = input.userId ?? input.ipAddress;
  const result = await db
    .prepare(
      `SELECT COUNT(*) AS count FROM usage_records WHERE ${subjectColumn} = ? AND action_type = ? AND created_at >= ?`,
    )
    .bind(subjectValue, input.actionType ?? DEFAULT_ACTION, periodStartIso(input.now ?? new Date(), window))
    .first<{ count: number }>();

  return Number(result?.count ?? 0);
}

async function insertUsageRecord(db: D1DatabaseLike, input: UsageInput, now: Date): Promise<void> {
  await db
    .prepare(
      'INSERT INTO usage_records (id, user_id, ip_address, action_type, created_at) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(
      crypto.randomUUID(),
      input.userId ?? null,
      input.ipAddress,
      input.actionType ?? DEFAULT_ACTION,
      now.toISOString(),
    )
    .run();
}

/**
 * 解析有效配额：
 * - limit > 0: 直接使用
 * - limit = -1: 走 hardCap（软上限保护）
 * - limit = 0 / undefined: 用默认 DEFAULT_LIMIT
 */
function resolveEffectiveLimit(input: UsageInput): number {
  if (input.limit === -1) {
    return input.hardCap ?? Number.MAX_SAFE_INTEGER;
  }
  if (typeof input.limit === 'number' && input.limit > 0) {
    return input.limit;
  }
  return DEFAULT_LIMIT;
}

function toState(
  count: number,
  limit: number,
  source: UsageState['source'],
  window: UsageWindow,
): UsageState {
  return {
    limit,
    count,
    remaining: Math.max(0, limit - count),
    source,
    window,
  };
}

export async function getUsageState(input: UsageInput): Promise<UsageState> {
  const window = input.window ?? 'daily';
  const limit = resolveEffectiveLimit(input);
  const kv = getKv(input.env);
  const key = getKey(input);

  if (kv) {
    try {
      const raw = await kv.get(key);
      return toState(Number(raw ?? 0), limit, 'kv', window);
    } catch (error) {
      console.warn('[usageLimit] KV read failed; falling back to D1/memory:', error);
    }
  }

  if (input.env?.DB) {
    try {
      return toState(await countFromD1(input.env.DB, input), limit, 'd1', window);
    } catch (error) {
      console.warn('[usageLimit] D1 read failed; falling back to memory:', error);
    }
  }

  return toState(memoryUsage.get(key) ?? 0, limit, 'memory', window);
}

export async function consumeUsage(input: UsageInput): Promise<UsageState> {
  const window = input.window ?? 'daily';
  const limit = resolveEffectiveLimit(input);
  const now = input.now ?? new Date();
  const kv = getKv(input.env);
  const key = getKey({ ...input, now });
  const ttl = window === 'monthly' ? TTL_MONTH_SECONDS : TTL_DAY_SECONDS;

  let nextCount: number | undefined;
  let source: UsageState['source'] | undefined;
  if (kv) {
    try {
      const current = Number((await kv.get(key)) ?? 0);
      const kvNextCount = current + 1;
      await kv.put(key, String(kvNextCount), { expirationTtl: ttl });
      nextCount = kvNextCount;
      source = 'kv';
    } catch (error) {
      console.warn('[usageLimit] KV write failed; falling back to D1/memory:', error);
    }
  }

  if (nextCount === undefined && input.env?.DB) {
    try {
      nextCount = (await countFromD1(input.env.DB, { ...input, now })) + 1;
      await insertUsageRecord(input.env.DB, input, now);
      return toState(nextCount, limit, 'd1', window);
    } catch (error) {
      console.warn('[usageLimit] D1 write failed; falling back to memory:', error);
    }
  }

  if (nextCount === undefined) {
    nextCount = (memoryUsage.get(key) ?? 0) + 1;
    memoryUsage.set(key, nextCount);
    return toState(nextCount, limit, 'memory', window);
  }

  if (input.env?.DB) {
    await insertUsageRecord(input.env.DB, input, now).catch((error) => {
      console.warn('[usageLimit] D1 side-record failed after KV write:', error);
    });
  }

  return toState(nextCount, limit, source ?? 'memory', window);
}
