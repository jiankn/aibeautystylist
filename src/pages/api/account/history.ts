/**
 * GET /api/account/history — 用户试妆历史分页列表
 *
 * Query 参数：
 *  - limit:  每页条数（1-100，默认 20）
 *  - offset: 偏移量（默认 0）
 *
 * 返回：
 *  - items:  TryOnJobSummary[]
 *  - total:  总条数（便于前端分页展示）
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/cloudflare/runtime';
import { getAuthUser } from '../../../lib/services/authService';
import {
  countJobsByUserId,
  listJobsByUserId,
} from '../../../lib/repositories/tryOnJobRepository';

export const GET: APIRoute = async ({ request }) => {
  const env = getRuntimeEnv();
  const cookieHeader = request.headers.get('cookie');
  const authUser = await getAuthUser(env, cookieHeader).catch(() => null);

  if (!authUser) {
    return new Response(
      JSON.stringify({ error: 'unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') ?? '20');
  const offset = Number(url.searchParams.get('offset') ?? '0');

  const [items, total] = await Promise.all([
    listJobsByUserId(env, authUser.id, { limit, offset }),
    countJobsByUserId(env, authUser.id),
  ]);

  return new Response(
    JSON.stringify({ items, total }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
