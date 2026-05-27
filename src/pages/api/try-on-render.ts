import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../lib/cloudflare/runtime';
import { getAuthUser } from '../../lib/services/authService';
import { getMembershipInfo } from '../../lib/services/membershipService';
import { renderMakeupPreview } from '../../lib/services/makeupRenderService';
import { consumeUsage, getUsageState } from '../../lib/services/usageLimitService';

export const POST: APIRoute = async (context) => {
  const runtimeEnv = getRuntimeEnv(context);
  const payload = await context.request.json().catch(() => ({}));
  const cookieHeader = context.request.headers.get('cookie');
  const authUser = await getAuthUser(runtimeEnv, cookieHeader).catch(() => null);
  const userId = authUser?.id ?? null;

  let ip = '127.0.0.1';
  try {
    ip = context.clientAddress || '127.0.0.1';
  } catch {
    ip = '127.0.0.1';
  }

  const membership = await getMembershipInfo(runtimeEnv, userId);
  if (!membership.canAccess('makeup_preview')) {
    return renderResponse({
      provider: 'none',
      fallback: true,
      fallbackReason: 'Makeup preview is a Pro feature.',
      generatedAt: new Date().toISOString(),
    }, 403);
  }

  const quotaBefore = await getUsageState({
    env: runtimeEnv,
    ipAddress: ip,
    userId,
    actionType: 'makeup_render',
    limit: membership.features.makeupRenderLimit ?? 0,
    hardCap: membership.features.makeupRenderHardCap,
    window: 'monthly',
  });

  if (quotaBefore.remaining <= 0) {
    return renderResponse({
      provider: 'none',
      fallback: true,
      fallbackReason: 'Monthly makeup preview quota has been used.',
      generatedAt: new Date().toISOString(),
    }, 429);
  }

  const photoBase64 = typeof payload.photoBase64 === 'string' ? payload.photoBase64 : undefined;
  const locale = payload.locale === 'zh' ? 'zh' : 'en';
  const look = payload.look && typeof payload.look === 'object'
    ? {
        id: typeof payload.look.id === 'string' ? payload.look.id : undefined,
        name: typeof payload.look.name === 'string' ? payload.look.name : undefined,
        reason: typeof payload.look.reason === 'string' ? payload.look.reason : undefined,
        scenario: typeof payload.look.scenario === 'string' ? payload.look.scenario : undefined,
        focus: typeof payload.look.focus === 'string' ? payload.look.focus : undefined,
        finish: typeof payload.look.finish === 'string' ? payload.look.finish : undefined,
        tutorialHeadline: typeof payload.look.tutorialHeadline === 'string' ? payload.look.tutorialHeadline : undefined,
      }
    : undefined;

  if (!photoBase64 || !look?.id) {
    return renderResponse({
      provider: 'none',
      fallback: true,
      fallbackReason: 'Missing photo or selected look.',
      generatedAt: new Date().toISOString(),
    }, 400);
  }

  const result = await renderMakeupPreview({ photoBase64, look, locale }, runtimeEnv);
  if (!result.fallback) {
    await consumeUsage({
      env: runtimeEnv,
      ipAddress: ip,
      userId,
      actionType: 'makeup_render',
      limit: membership.features.makeupRenderLimit ?? 0,
      hardCap: membership.features.makeupRenderHardCap,
      window: 'monthly',
    });
  }

  return renderResponse(result);
};

function renderResponse(render: unknown, status = 200): Response {
  return new Response(JSON.stringify({ _render: render }), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
