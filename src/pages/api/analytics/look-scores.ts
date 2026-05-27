import type { APIRoute } from 'astro';
import { getLookScoreReport } from '../../../lib/repositories/lookAnalyticsRepository';
import { adminForbiddenResponse, requireAdminUser } from '../../../lib/services/adminAccess';

export const GET: APIRoute = async (context) => {
  const { env, user, ok } = await requireAdminUser(context);
  if (!ok) {
    return adminForbiddenResponse(user ? 'forbidden' : 'unauthenticated');
  }

  const url = new URL(context.request.url);
  const days = Number(url.searchParams.get('days') ?? '28');
  const source = url.searchParams.get('source');

  const report = await getLookScoreReport(env, {
    days: Number.isFinite(days) ? days : 28,
    source: source === 'all' ? null : source,
  }).catch((error) => {
    console.error('[analytics/look-scores]', error);
    return null;
  });

  if (!report) {
    return new Response(JSON.stringify({ error: 'score_report_failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  return new Response(JSON.stringify(report), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
};
