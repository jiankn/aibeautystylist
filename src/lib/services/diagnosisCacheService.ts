/**
 * 诊断结果 24h 缓存服务
 *
 * 目的：避免用户重复点 "Re-analyze" 浪费 Gemini API 调用。
 * 用户在 24h 内对相同照片+场景+经验组合的请求会命中缓存。
 *
 * 缓存 key 设计：
 *   diag-cache:{subjectHash}:{photoHash}:{scenario}:{experience}:{lookSlug}:{locale}
 *
 * subjectHash: userId 优先，否则 IP（避免 IP 重置但同一用户）
 * photoHash: 对照片 base64 取 SHA-256 前 16 字符
 *
 * 存储：USAGE_LIMITS KV（与配额共用），TTL=24h
 */
import type { KVNamespaceLike, RuntimeEnv } from '../cloudflare/runtime';
import type { GeneratedTryOnPlan } from './tryOnService';

const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours
const KEY_PREFIX = 'diag-cache:';

function getKv(env?: RuntimeEnv): KVNamespaceLike | undefined {
  return env?.USAGE_LIMITS ?? env?.SESSION;
}

/**
 * 计算字符串的 SHA-256 哈希前 16 字符（够区分但不暴露原图）
 */
async function shortHash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .slice(0, 8) // 8 bytes = 16 hex chars
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface CacheKeyInput {
  userId?: string | null;
  ipAddress: string;
  photoBase64: string;
  scenario: string;
  experience: string;
  lookSlug?: string;
  locale: string;
}

async function buildCacheKey(input: CacheKeyInput): Promise<string> {
  const subject = input.userId ? `u:${input.userId}` : `ip:${input.ipAddress}`;
  // 取 photoBase64 完整字符串的 hash（base64 字符串本身就是去掉了图像格式的稳定输入）
  const photoHash = await shortHash(input.photoBase64);
  const lookSegment = input.lookSlug || 'no-look';
  return `${KEY_PREFIX}${subject}:${photoHash}:${input.scenario}:${input.experience}:${lookSegment}:${input.locale}`;
}

export async function getCachedDiagnosis(
  env: RuntimeEnv | undefined,
  input: CacheKeyInput,
): Promise<GeneratedTryOnPlan | null> {
  const kv = getKv(env);
  if (!kv) return null;

  try {
    const key = await buildCacheKey(input);
    const raw = await kv.get(key);
    if (!raw) return null;

    const cached = JSON.parse(raw) as GeneratedTryOnPlan;
    // 标记为缓存命中，方便前端/日志区分
    if (cached.meta) {
      cached.meta = { ...cached.meta, cached: true } as GeneratedTryOnPlan['meta'] & { cached?: boolean };
    }
    return cached;
  } catch (error) {
    console.warn('[diagnosisCache] Failed to read cache:', error);
    return null;
  }
}

export async function setCachedDiagnosis(
  env: RuntimeEnv | undefined,
  input: CacheKeyInput,
  plan: GeneratedTryOnPlan,
): Promise<void> {
  const kv = getKv(env);
  if (!kv) return;

  // 不缓存 fallback 结果（mock 数据），避免污染
  if (plan.meta?.fallback) return;

  try {
    const key = await buildCacheKey(input);
    // 存储前移除可能的 cached 标记，避免双重标记
    const toStore = {
      ...plan,
      meta: { ...plan.meta, cached: false },
    };
    await kv.put(key, JSON.stringify(toStore), { expirationTtl: CACHE_TTL_SECONDS });
  } catch (error) {
    console.warn('[diagnosisCache] Failed to write cache:', error);
  }
}
