import type { APIRoute } from "astro";

import {
  createAccount,
  getAccountByEmail,
  getAccountByUserId,
  getOAuthIdentity,
  linkOAuthIdentity,
  markEmailVerified,
  normalizeEmail,
} from "../../../../lib/accounts";
import { createSession, setSessionCookie } from "../../../../lib/authSession";
import {
  getGoogleOAuthCallbackUrl,
  getOAuthLoginStatusUrl,
  GOOGLE_OAUTH_NEXT_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
  isGoogleOAuthConfigured,
  safeAuthNextPath,
} from "../../../../lib/googleOAuth";
import { createProxyFetcher } from "../../../../lib/proxyFetch";
import { getRuntimeBindings } from "../../../../lib/runtime";

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
}

interface GoogleUserInfo {
  sub?: string;
  email?: string;
  email_verified?: boolean;
}

export const GET: APIRoute = async ({ cookies, request, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const providerError = url.searchParams.get("error");
  const expectedState = cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  const next = safeAuthNextPath(cookies.get(GOOGLE_OAUTH_NEXT_COOKIE)?.value);
  cookies.delete(GOOGLE_OAUTH_STATE_COOKIE, { path: "/" });
  cookies.delete(GOOGLE_OAUTH_NEXT_COOKIE, { path: "/" });

  const bindings = getRuntimeBindings();
  const { DB } = bindings;
  if (!isGoogleOAuthConfigured(bindings) || !DB) {
    return redirect(getOAuthLoginStatusUrl("unavailable", next), 302);
  }
  if (providerError) {
    return redirect(
      getOAuthLoginStatusUrl(
        providerError === "access_denied" ? "cancelled" : "failed",
        next,
      ),
      302,
    );
  }
  // state 校验：缺失或不匹配视为 CSRF，拒绝。
  if (!code || !state || !expectedState || state !== expectedState) {
    return redirect(getOAuthLoginStatusUrl("invalid", next), 302);
  }

  const fetcher = bindings.OUTBOUND_PROXY_URL
    ? createProxyFetcher(bindings.OUTBOUND_PROXY_URL)
    : fetch;
  const callbackUrl = getGoogleOAuthCallbackUrl(bindings, request.url);

  try {
    const tokenRes = await fetcher("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: bindings.GOOGLE_OAUTH_CLIENT_ID!,
        client_secret: bindings.GOOGLE_OAUTH_CLIENT_SECRET!,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }).toString(),
    });
    const tokenData = (await tokenRes
      .json()
      .catch(() => null)) as GoogleTokenResponse | null;
    if (!tokenRes.ok || !tokenData?.access_token) {
      return redirect(getOAuthLoginStatusUrl("failed", next), 302);
    }

    const infoRes = await fetcher(
      "https://openidconnect.googleapis.com/v1/userinfo",
      { headers: { authorization: `Bearer ${tokenData.access_token}` } },
    );
    const info = (await infoRes
      .json()
      .catch(() => null)) as GoogleUserInfo | null;
    if (!infoRes.ok || !info?.sub || !info.email) {
      return redirect(getOAuthLoginStatusUrl("failed", next), 302);
    }
    if (info.email_verified !== true) {
      return redirect(getOAuthLoginStatusUrl("unverified", next), 302);
    }

    const email = normalizeEmail(info.email);
    const identity = await getOAuthIdentity("google", info.sub, DB);
    let userId = identity?.userId;

    if (userId) {
      const linkedAccount = await getAccountByUserId(userId, DB);
      if (!linkedAccount) {
        return redirect(getOAuthLoginStatusUrl("conflict", next), 302);
      }
    } else {
      // 已有同邮箱账户则关联，否则新建账户（Google 邮箱视为已验证）。
      const existing = await getAccountByEmail(email, DB);
      if (existing) {
        userId = existing.userId;
        if (!existing.emailVerifiedAt) await markEmailVerified(userId, DB);
      } else {
        userId = `user_${crypto.randomUUID()}`;
        await createAccount(
          { userId, email, emailVerifiedAt: new Date().toISOString() },
          DB,
        );
      }
      await linkOAuthIdentity(
        { userId, provider: "google", providerUserId: info.sub, email },
        DB,
      );
      const linkedIdentity = await getOAuthIdentity("google", info.sub, DB);
      if (!linkedIdentity || linkedIdentity.userId !== userId) {
        return redirect(getOAuthLoginStatusUrl("conflict", next), 302);
      }
    }

    const session = await createSession(userId, DB);
    setSessionCookie(cookies, session.token, import.meta.env.PROD);
    return redirect(next === "/" ? "/?login=success" : next, 302);
  } catch {
    return redirect(getOAuthLoginStatusUrl("failed", next), 302);
  }
};
