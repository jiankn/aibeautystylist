/**
 * POST /api/account/delete — 彻底删除账号
 *
 * PRD §15.2 必须的「彻底删除账号」入口。
 *
 * 安全保护：要求 body 中传 { confirm: 'DELETE' }，避免误触。
 *
 * 流程：
 *   1. 校验 confirm 短语
 *   2. 级联清理 D1 中所有用户数据（userRepository.deleteUser）
 *   3. 清除当前 Session Cookie，让用户立刻退出
 *
 * 注：Stripe 远端的 customer/subscription 取消由 Stripe Customer Portal
 * 完成（用户应在删账前自行取消订阅）。这里不再调用 Stripe API，避免
 * 半成功状态。后续若需要可在 stripeService 加 deleteCustomer 调用。
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/cloudflare/runtime';
import {
  buildClearSessionCookie,
  getAuthUser,
  logout,
} from '../../../lib/services/authService';
import { deleteUser } from '../../../lib/repositories/userRepository';

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

  // ── 二次确认：要求请求体里有 confirm: 'DELETE' ──
  let confirmValue: string | undefined;
  try {
    const body = (await request.json()) as { confirm?: string };
    confirmValue = body.confirm;
  } catch {
    /* 空 body 或非 JSON */
  }

  if (confirmValue !== 'DELETE') {
    return new Response(
      JSON.stringify({
        error: 'confirm_required',
        message: 'Send { "confirm": "DELETE" } to confirm permanent deletion.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    // 先 logout（删除当前 session 行）
    await logout(env, cookieHeader);
    // 再级联删除用户数据
    await deleteUser(env, authUser.id);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // 清除浏览器 cookie
          'Set-Cookie': buildClearSessionCookie(),
        },
      },
    );
  } catch (error) {
    console.error('[account/delete]', error);
    return new Response(
      JSON.stringify({ error: 'delete_failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
