/**
 * POST /api/makeup-preview — 生成妆效预览图
 *
 * 接收素颜照 Base64 + 妆容方案信息，调用 Gemini Image API 生成妆后图
 * 仅 Pro/Premium 用户可用（Free 用户被 membershipService 门控）
 *
 * 配额（独立于诊断配额）：
 * - Free: 0 张/月（直接 403）
 * - Pro: 30 张/月
 * - Premium: 软上限无限（硬上限 200 张/月防滥用）
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../lib/cloudflare/runtime';
import { getAuthUser } from '../../lib/services/authService';
import { getMembershipInfo } from '../../lib/services/membershipService';
import { renderMakeupPreview, type MakeupRenderLookInput } from '../../lib/services/makeupRenderService';
import { consumeUsage, getUsageState } from '../../lib/services/usageLimitService';

export const POST: APIRoute = async (context) => {
  const { request } = context;
  const env = getRuntimeEnv(context);

  let ip = '127.0.0.1';
  try {
    ip = context.clientAddress || '127.0.0.1';
  } catch {
    // dev mode 不支持 clientAddress
  }

  const cookieHeader = request.headers.get('cookie');
  const authUser = await getAuthUser(env, cookieHeader).catch(() => null);
  const userId = authUser?.id ?? null;

  // ─── 会员检查 ───
  const membership = await getMembershipInfo(env, userId);
  if (!membership.canAccess('makeup_preview')) {
    return new Response(
      JSON.stringify({
        error: 'upgrade_required',
        message: 'Makeup preview is a Pro feature. Upgrade to see your look!',
        upgradeUrl: '/membership',
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // ─── 配额参数 ───
  const renderLimit = membership.features.makeupRenderLimit ?? 0;
  const renderHardCap = membership.features.makeupRenderHardCap;
  const window: 'monthly' = 'monthly'; // Pro/Premium 都按月

  // 配额检查
  const quotaBefore = await getUsageState({
    env,
    ipAddress: ip,
    userId,
    actionType: 'makeup_render',
    limit: renderLimit,
    hardCap: renderHardCap,
    window,
  });

  if (quotaBefore.remaining <= 0) {
    return new Response(
      JSON.stringify({
        error: 'rate_limited',
        message:
          membership.tier === 'pro'
            ? "You've used all 30 monthly makeup previews. Upgrade to Premium for unlimited."
            : "You've reached this month's fair-use limit on makeup previews.",
        remaining: 0,
        tier: membership.tier,
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // ─── 解析请求 ───
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const photoBase64 = body.photoBase64 as string | undefined;
  const look = body.look as MakeupRenderLookInput | undefined;
  const locale = (body.locale as string) ?? 'en';

  if (!photoBase64) {
    return new Response(
      JSON.stringify({ error: 'missing_photo', message: 'Photo is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  console.log(`[makeup-preview] Generating for user=${userId ?? 'anon'}, tier=${membership.tier}, look=${look?.name ?? 'default'}`);
  const startTime = Date.now();

  const result = await renderMakeupPreview({ photoBase64, look, locale }, env);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[makeup-preview] Done in ${elapsed}s, fallback=${result.fallback}`);

  if (result.fallback) {
    return new Response(
      JSON.stringify({
        error: 'generation_failed',
        message: result.fallbackReason ?? 'Image generation failed',
        provider: result.provider,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // 仅在生成成功后消耗配额
  const quotaAfter = await consumeUsage({
    env,
    ipAddress: ip,
    userId,
    actionType: 'makeup_render',
    limit: renderLimit,
    hardCap: renderHardCap,
    window,
  });

  return new Response(
    JSON.stringify({
      success: true,
      image: result.image,
      generatedAt: result.generatedAt,
      elapsed: `${elapsed}s`,
      _remaining: quotaAfter.remaining,
      _tier: membership.tier,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
