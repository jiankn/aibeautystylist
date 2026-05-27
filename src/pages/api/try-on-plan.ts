import type { APIRoute } from 'astro';
import { generateTryOnPlan } from '../../lib/services/tryOnService';
import { getRuntimeEnv } from '../../lib/cloudflare/runtime';
import { consumeUsage, getUsageState } from '../../lib/services/usageLimitService';
import { deleteTryOnPhoto, storeTryOnPhoto } from '../../lib/services/uploadService';
import { saveTryOnJob } from '../../lib/repositories/tryOnJobRepository';
import { getAuthUser } from '../../lib/services/authService';
import { getMembershipInfo, trimResultByTier } from '../../lib/services/membershipService';
import { getCachedDiagnosis, setCachedDiagnosis } from '../../lib/services/diagnosisCacheService';

/**
 * POST /api/try-on-plan
 *
 * 接收前端上传的压缩自拍 Base64 + 场景/经验参数，
 * 调用 Gemini AI 诊断（或降级 mock），返回试妆方案 JSON。
 *
 * 配额逻辑（基于成本/利润率分析）：
 * - Free: 每 UTC 日 1 次诊断
 * - Pro: 每 UTC 月 10 次诊断
 * - Premium: 软上限无限（硬上限 100 次/月防滥用）
 *
 * 配额主体：已登录用户优先按 userId 计数；匿名用户按 IP 计数
 */
export const POST: APIRoute = async (context) => {
  const { request } = context;
  const runtimeEnv = getRuntimeEnv(context);

  // ─── 安全获取客户端 IP（dev 模式下 clientAddress 会抛异常） ───
  let ip = '127.0.0.1';
  try {
    ip = context.clientAddress || '127.0.0.1';
  } catch {
    // Astro 本地开发服务器不支持 clientAddress，忽略
  }

  // ─── 解析请求体 ───
  const payload = await request.json().catch(() => ({}));

  const scenario = typeof payload.scenario === 'string' ? payload.scenario : 'office';
  const experience = typeof payload.experience === 'string' ? payload.experience : 'beginner';
  const lookSlug = typeof payload.lookSlug === 'string' ? payload.lookSlug : undefined;
  const hasPhoto = Boolean(payload.hasPhoto);
  const photoBase64 = typeof payload.photoBase64 === 'string' ? payload.photoBase64 : undefined;
  const locale = payload.locale === 'zh' ? 'zh' : 'en';

  // ─── 可选 Auth ───
  const cookieHeader = request.headers.get('cookie');
  const authUser = await getAuthUser(runtimeEnv, cookieHeader).catch(() => null);
  const userId = authUser?.id ?? null;

  // ─── 根据会员等级解析配额参数 ───
  const membership = await getMembershipInfo(runtimeEnv, userId);
  const tier = membership.tier;
  const features = membership.features;

  // tier → 配额窗口和上限映射
  // Free 用日窗口（每天 1 次），Pro/Premium 用月窗口
  const window: 'daily' | 'monthly' = tier === 'free' ? 'daily' : 'monthly';
  const limit = features.diagnosisLimit;
  const hardCap = features.diagnosisHardCap;

  const quotaBefore = await getUsageState({
    env: runtimeEnv,
    ipAddress: ip,
    userId,
    actionType: 'tryon_diagnosis',
    limit,
    hardCap,
    window,
  });

  // ─── 配额检查（仅当有真实照片时才计费）───
  if (hasPhoto && photoBase64 && quotaBefore.remaining <= 0) {
    const upgradeMsg =
      tier === 'free'
        ? "You've used your free diagnosis for today. Sign in to Pro for 10 monthly diagnoses."
        : tier === 'pro'
          ? "You've used all 10 monthly diagnoses. Upgrade to Premium for unlimited access."
          : "You've reached the monthly fair-use limit. Please contact support if you need more.";

    return new Response(
      JSON.stringify({
        error: 'rate_limited',
        message: upgradeMsg,
        remaining: 0,
        tier,
        window,
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      },
    );
  }

  // ─── 24h 缓存查询（仅对真实 AI 调用，重复点 Re-analyze 不浪费 token）───
  let result;
  let cacheHit = false;

  if (hasPhoto && photoBase64) {
    const cached = await getCachedDiagnosis(runtimeEnv, {
      userId,
      ipAddress: ip,
      photoBase64,
      scenario,
      experience,
      lookSlug,
      locale,
    });

    if (cached) {
      console.log(`[try-on-plan] Cache HIT for user=${userId ?? 'anon'}, scenario=${scenario}`);
      result = cached;
      cacheHit = true;
    }
  }

  // ─── 上传照片到 R2（如配置）───
  const upload = hasPhoto && photoBase64 && !cacheHit
    ? await storeTryOnPhoto({
        env: runtimeEnv,
        photoBase64,
        ipAddress: ip,
      })
    : { provider: 'mock' as const, stored: false };

  // ─── 缓存未命中 → 调用 AI 服务层 ───
  if (!result) {
    result = await generateTryOnPlan({
      scenario,
      experience,
      lookSlug,
      hasPhoto,
      photoBase64,
      locale,
      tier, // free 用户走 flash-lite，pro/premium 走 flash
    }, runtimeEnv);

    // AI 调用成功且未降级 → 写入 24h 缓存
    if (hasPhoto && photoBase64 && !result.meta.fallback) {
      await setCachedDiagnosis(runtimeEnv, {
        userId,
        ipAddress: ip,
        photoBase64,
        scenario,
        experience,
        lookSlug,
        locale,
      }, result);
    }
  }

  if (result.meta.fallback && upload.stored && upload.key) {
    await deleteTryOnPhoto(runtimeEnv, upload.key).catch((error) => {
      console.error('[try-on-plan] fallback 后删除上传照片失败:', error);
    });
  }

  // ─── 配额消耗规则 ───
  // - 缓存命中：不消耗（用户没花钱让我们调 AI）
  // - 真实 AI 成功：消耗 1 次
  // - fallback 到 mock：不消耗
  let quotaAfter = quotaBefore;
  if (hasPhoto && photoBase64 && !result.meta.fallback && !cacheHit) {
    quotaAfter = await consumeUsage({
      env: runtimeEnv,
      ipAddress: ip,
      userId,
      actionType: 'tryon_diagnosis',
      limit,
      hardCap,
      window,
    });
  }

  const jobId = await saveTryOnJob({
    env: runtimeEnv,
    result,
    scenario,
    experience,
    upload,
    userId,
  }).catch((error) => {
    console.error('[try-on-plan] 保存 tryon_jobs 失败:', error);
    return null;
  });

  // 根据会员等级裁剪返回内容
  const trimmedResult = trimResultByTier(result, membership);

  return new Response(JSON.stringify({
    ...trimmedResult,
    _remaining: hasPhoto ? quotaAfter.remaining : quotaAfter.limit,
    _quotaSource: quotaAfter.source,
    _quotaWindow: quotaAfter.window,
    _tier: tier,
    _cached: cacheHit,
    _jobId: jobId,
    _upload: {
      provider: upload.provider,
      stored: upload.stored && !result.meta.fallback,
      key: upload.stored && !result.meta.fallback ? upload.key : undefined,
      error: upload.error,
    },
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
