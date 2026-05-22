import type { D1DatabaseLike, KVNamespaceLike, RuntimeEnv } from '../cloudflare/runtime';

export interface UsageState {
  limit: number;
  count: number;
  remaining: number;
  source: 'kv' | 'd1' | 'memory';
}

interface UsageInput {
  env?: RuntimeEnv;
  ipAddress: string;
  userId?: string | null;
  actionType?: string;
  limit?: number;
  now?: Date;
}

const memoryUsage = new Map<string, number>();
const DEFAULT_ACTION = 'tryon_diagnosis';
const DEFAULT_LIMIT = 3;
const TTL_SECONDS = 60 * 60 * 48;

function dayKey(now: Date): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

function dayStartIso(now: Date): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

function getKv(env?: RuntimeEnv): KVNamespaceLike | undefined {
  return env?.USAGE_LIMITS ?? env?.SESSION;
}

function getKey(input: UsageInput): string {
  return `usage:${input.actionType ?? DEFAULT_ACTION}:${dayKey(input.now ?? new Date())}:${input.ipAddress}`;
}

async function countFromD1(db: D1DatabaseLike, input: UsageInput): Promise<number> {
  const result = await db
    .prepare(
      'SELECT COUNT(*) AS count FROM usage_records WHERE ip_address = ? AND action_type = ? AND created_at >= ?',
    )
    .bind(input.ipAddress, input.actionType ?? DEFAULT_ACTION, dayStartIso(input.now ?? new Date()))
    .first<{ count: number }>();

  return Number(result?.count ?? 0);
}

function toState(count: number, limit: number, source: UsageState['source']): UsageState {
  return {
    limit,
    count,
    remaining: Math.max(0, limit - count),
    source,
  };
}

export async function getUsageState(input: UsageInput): Promise<UsageState> {
  const limit = input.limit ?? DEFAULT_LIMIT;
  const kv = getKv(input.env);
  const key = getKey(input);

  if (kv) {
    const raw = await kv.get(key);
    return toState(Number(raw ?? 0), limit, 'kv');
  }

  if (input.env?.DB) {
    return toState(await countFromD1(input.env.DB, input), limit, 'd1');
  }

  return toState(memoryUsage.get(key) ?? 0, limit, 'memory');
}

export async function consumeUsage(input: UsageInput): Promise<UsageState> {
  const limit = input.limit ?? DEFAULT_LIMIT;
  const now = input.now ?? new Date();
  const kv = getKv(input.env);
  const key = getKey({ ...input, now });

  let nextCount: number;
  if (kv) {
    const current = Number((await kv.get(key)) ?? 0);
    nextCount = current + 1;
    await kv.put(key, String(nextCount), { expirationTtl: TTL_SECONDS });
  } else if (input.env?.DB) {
    nextCount = (await countFromD1(input.env.DB, { ...input, now })) + 1;
  } else {
    nextCount = (memoryUsage.get(key) ?? 0) + 1;
    memoryUsage.set(key, nextCount);
  }

  if (input.env?.DB) {
    await input.env.DB
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

  return toState(nextCount, limit, kv ? 'kv' : input.env?.DB ? 'd1' : 'memory');
}
