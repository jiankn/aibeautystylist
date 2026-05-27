/**
 * POST /api/account/delete-history — 删除当前用户的所有试妆记录
 *
 * PRD §15.2 / §15.3: 用户必须能在不删账号的前提下清空数据。
 * 不删除：账号、订阅、Stripe customer。
 * 删除：tryon_jobs（D1 行）与对应 R2 自拍对象。
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/cloudflare/runtime';
import { getAuthUser } from '../../../lib/services/authService';
import { deleteJobsByUserId } from '../../../lib/repositories/tryOnJobRepository';

export const POST: APIRoute = async ({ request }) => {
  const env = getRuntimeEnv();
  const cookieHeader = request.headers.get('cookie');
  const authUser = await getAuthUser(env, cookieHeader).catch(() => null);

  if (!authUser) {
    return new Response(
      JSON.stringify({ error: 'unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const { deletedPhotoKeys } = await deleteJobsByUserId(env, authUser.id);
    return new Response(
      JSON.stringify({ success: true, deletedPhotos: deletedPhotoKeys.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('[account/delete-history]', error);
    return new Response(
      JSON.stringify({ error: 'delete_failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
