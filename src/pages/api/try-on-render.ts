import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../lib/cloudflare/runtime';
import { renderMakeupPreview } from '../../lib/services/makeupRenderService';

export const POST: APIRoute = async (context) => {
  const runtimeEnv = getRuntimeEnv(context);
  const payload = await context.request.json().catch(() => ({}));

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
    return new Response(
      JSON.stringify({
        _render: {
          provider: 'none',
          fallback: true,
          fallbackReason: 'Missing photo or selected look.',
          generatedAt: new Date().toISOString(),
        },
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      },
    );
  }

  const result = await renderMakeupPreview({ photoBase64, look, locale }, runtimeEnv);

  return new Response(
    JSON.stringify({ _render: result }),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    },
  );
};
