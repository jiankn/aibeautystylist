import type { APIRoute } from 'astro';
import { generateTryOnPlan } from '../../lib/services/tryOnService';

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
export const POST: APIRoute = async ({ request, clientAddress }) => {
  // ─── 解析请求体 ───
  const payload = await request.json().catch(() => ({}));

  const scenario = typeof payload.scenario === 'string' ? payload.scenario : 'office';
  const experience = typeof payload.experience === 'string' ? payload.experience : 'beginner';
  const hasPhoto = Boolean(payload.hasPhoto);
  const photoBase64 = typeof payload.photoBase64 === 'string' ? payload.photoBase64 : undefined;

  // ─── IP 频率限制（基础版：依赖后续 KV 接入） ───
  // TODO: 接入 Cloudflare KV 实现持久化计数
  // 当前先在内存中做简易限流（重启后重置，适合开发阶段）
  const ip = clientAddress || 'unknown';
  const now = new Date();
  const todayKey = `${ip}:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  if (!rateLimitMap.has(todayKey)) {
    rateLimitMap.set(todayKey, 0);
    // 清理过期条目（简单版本）
    if (rateLimitMap.size > 10000) {
      const keys = Array.from(rateLimitMap.keys());
      for (let i = 0; i < keys.length - 5000; i++) {
        rateLimitMap.delete(keys[i]);
      }
    }
  }

  const currentCount = rateLimitMap.get(todayKey)!;
  const DAILY_LIMIT = 3;

  // 仅在有照片（真实 AI 调用）时消耗配额
  if (hasPhoto && photoBase64 && currentCount >= DAILY_LIMIT) {
    return new Response(
      JSON.stringify({
        error: 'rate_limited',
        message: '今日免费诊断次数已用完（3次/天），升级会员可无限使用。',
        remaining: 0,
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      },
    );
  }

  // ─── 调用服务层 ───
  const result = await generateTryOnPlan({
    scenario,
    experience,
    hasPhoto,
    photoBase64,
  });

  // 仅在真实 AI 调用成功且未降级时消耗配额
  if (hasPhoto && photoBase64 && !result.meta.fallback) {
    rateLimitMap.set(todayKey, currentCount + 1);
  }

  // 在响应中附带剩余次数
  const remaining = hasPhoto
    ? Math.max(0, DAILY_LIMIT - (rateLimitMap.get(todayKey) ?? 0))
    : DAILY_LIMIT;

  return new Response(JSON.stringify({ ...result, _remaining: remaining }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};

// ─── 简易内存限流 Map（开发阶段用，生产应迁移到 KV）───
const rateLimitMap = new Map<string, number>();
