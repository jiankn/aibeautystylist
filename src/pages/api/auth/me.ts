/**
 * GET /api/auth/me — 获取当前登录用户信息
 * 前端可用此接口判断登录状态、会员等级
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/cloudflare/runtime';
import { getAuthUser } from '../../../lib/services/authService';

export const GET: APIRoute = async ({ request }) => {
  const env = getRuntimeEnv();
  const cookieHeader = request.headers.get('cookie');

  const user = await getAuthUser(env, cookieHeader);

  if (!user) {
    return new Response(
      JSON.stringify({ authenticated: false }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  return new Response(
    JSON.stringify({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        tier: user.tier,
        features: user.features,
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
