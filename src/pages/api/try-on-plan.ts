import type { APIRoute } from 'astro';
import { generateTryOnPlan } from '../../lib/services/tryOnService';
import { getRuntimeEnv } from '../../lib/cloudflare/runtime';
import { consumeUsage, getUsageState } from '../../lib/services/usageLimitService';
import { deleteTryOnPhoto, storeTryOnPhoto } from '../../lib/services/uploadService';
import { saveTryOnJob } from '../../lib/repositories/tryOnJobRepository';

/**
 * POST /api/try-on-plan
 *
 * 接收前端上传的压缩自拍 Base64 + 场景/经验参数，
 * 调用 Gemini AI 诊断（或降级 mock），返回试妆方案 JSON。
 *
 * 请求体：
 *   { scenario: string, experience: string, hasPhoto: boolean, photoBase64?: string }
 *
 * IP 频率限制：免费版每 IP 每天 3 次（使用 Cloudflare KV）
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
  const hasPhoto = Boolean(payload.hasPhoto);
  const photoBase64 = typeof payload.photoBase64 === 'string' ? payload.photoBase64 : undefined;
  const locale = payload.locale === 'zh' ? 'zh' : 'en';

  const DAILY_LIMIT = 3;
  const quotaBefore = await getUsageState({
    env: runtimeEnv,
    ipAddress: ip,
    limit: DAILY_LIMIT,
  });

  // 仅在有照片（真实 AI 调用）时消耗配额
  if (hasPhoto && photoBase64 && quotaBefore.count >= DAILY_LIMIT) {
    return new Response(
      JSON.stringify({
        error: 'rate_limited',
        message: 'You\'ve used all 3 free diagnoses for today. Upgrade to Pro for unlimited access.',
        remaining: 0,
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      },
    );
  }

  const upload = hasPhoto && photoBase64
    ? await storeTryOnPhoto({
        env: runtimeEnv,
        photoBase64,
        ipAddress: ip,
      })
    : { provider: 'mock' as const, stored: false };

  // ─── 调用服务层 ───
  const result = await generateTryOnPlan({
    scenario,
    experience,
    hasPhoto,
    photoBase64,
    locale,
  }, runtimeEnv);

  if (result.meta.fallback && upload.stored && upload.key) {
    await deleteTryOnPhoto(runtimeEnv, upload.key).catch((error) => {
      console.error('[try-on-plan] fallback 后删除上传照片失败:', error);
    });
  }

  // 仅在真实 AI 调用成功且未降级时消耗配额
  let quotaAfter = quotaBefore;
  if (hasPhoto && photoBase64 && !result.meta.fallback) {
    quotaAfter = await consumeUsage({
      env: runtimeEnv,
      ipAddress: ip,
      limit: DAILY_LIMIT,
    });
  }

  const jobId = await saveTryOnJob({
    env: runtimeEnv,
    result,
    scenario,
    experience,
    upload,
  }).catch((error) => {
    console.error('[try-on-plan] 保存 tryon_jobs 失败:', error);
    return null;
  });

  return new Response(JSON.stringify({
    ...result,
    _remaining: hasPhoto ? quotaAfter.remaining : DAILY_LIMIT,
    _quotaSource: quotaAfter.source,
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
