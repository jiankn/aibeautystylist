import type { APIRoute } from 'astro';
import { adminForbiddenResponse, requireAdminUser } from '../../../lib/services/adminAccess';
import { cleanupStoredPhotosOlderThan } from '../../../lib/repositories/tryOnJobRepository';

export const POST: APIRoute = async (context) => {
  const { env, user, ok } = await requireAdminUser(context);
  if (!ok) {
    return adminForbiddenResponse(user ? 'forbidden' : 'unauthenticated');
  }

  const body = await context.request.json().catch(() => ({})) as Record<string, unknown>;
  const olderThanHours = readNumber(body.olderThanHours) ?? 24;
  const limit = readNumber(body.limit) ?? 100;
  const dryRun = body.dryRun === true;

  try {
    const result = await cleanupStoredPhotosOlderThan(env, { olderThanHours, limit, dryRun });
    return json({
      success: true,
      cutoff: result.cutoff,
      candidates: result.keys.length,
      deletedPhotos: result.deletedPhotoKeys.length,
      dryRun: result.dryRun,
    });
  } catch (error) {
    console.error('[admin/cleanup-uploads]', error);
    return json(
      {
        success: false,
        error: 'cleanup_failed',
        message: error instanceof Error ? error.message : 'Unknown cleanup error',
      },
      500,
    );
  }
};

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
