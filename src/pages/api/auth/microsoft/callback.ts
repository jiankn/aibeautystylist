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
import { isPrimaryAdminEmail } from "../../../../lib/adminPolicy";
import { createSession, setSessionCookie } from "../../../../lib/authSession";
import {
  getOAuthLoginStatusUrl,
  safeAuthNextPath,
} from "../../../../lib/oauth";
import {
  decodeMicrosoftIdToken,
  getMicrosoftOAuthCallbackUrl,
  getMicrosoftTokenUrl,
  getMicrosoftUserInfoUrl,
  MICROSOFT_OAUTH_NEXT_COOKIE,
  MICROSOFT_OAUTH_PKCE_COOKIE,
  MICROSOFT_OAUTH_STATE_COOKIE,
  isMicrosoftOAuthConfigured,
  isUsableMicrosoftIdTokenClaims,
  resolveMicrosoftEmail,
  type MicrosoftProfileClaims,
} from "../../../../lib/microsoftOAuth";
import { createProxyFetcher } from "../../../../lib/proxyFetch";
import { getRuntimeBindings } from "../../../../lib/runtime";

interface MicrosoftTokenResponse {
  access_token?: string;
  id_token?: string;
  error?: string;
}

export const GET: APIRoute = async ({ cookies, request, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const providerError = url.searchParams.get("error");
  const expectedState = cookies.get(MICROSOFT_OAUTH_STATE_COOKIE)?.value;
  const codeVerifier = cookies.get(MICROSOFT_OAUTH_PKCE_COOKIE)?.value;
  const next = safeAuthNextPath(
    cookies.get(MICROSOFT_OAUTH_NEXT_COOKIE)?.value,
  );
  cookies.delete(MICROSOFT_OAUTH_STATE_COOKIE, { path: "/" });
  cookies.delete(MICROSOFT_OAUTH_NEXT_COOKIE, { path: "/" });
  cookies.delete(MICROSOFT_OAUTH_PKCE_COOKIE, { path: "/" });

  const bindings = getRuntimeBindings();
  const { DB } = bindings;
  if (!isMicrosoftOAuthConfigured(bindings) || !DB) {
    return redirect(
      getOAuthLoginStatusUrl("unavailable", next, "microsoft"),
      302,
    );
  }
  if (providerError) {
    return redirect(
      getOAuthLoginStatusUrl(
        providerError === "access_denied" ? "cancelled" : "failed",
        next,
        "microsoft",
      ),
      302,
    );
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    return redirect(getOAuthLoginStatusUrl("invalid", next, "microsoft"), 302);
  }
  if (!codeVerifier) {
    return redirect(getOAuthLoginStatusUrl("invalid", next, "microsoft"), 302);
  }

  const fetcher = bindings.OUTBOUND_PROXY_URL
    ? createProxyFetcher(bindings.OUTBOUND_PROXY_URL)
    : fetch;
  const callbackUrl = getMicrosoftOAuthCallbackUrl(bindings, request.url);

  try {
    const tokenRes = await fetcher(getMicrosoftTokenUrl(), {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: bindings.MICROSOFT_OAUTH_CLIENT_ID!,
        client_secret: bindings.MICROSOFT_OAUTH_CLIENT_SECRET!,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
      }).toString(),
    });
    const tokenData = (await tokenRes
      .json()
      .catch(() => null)) as MicrosoftTokenResponse | null;
    if (!tokenRes.ok || !tokenData?.access_token) {
      return redirect(getOAuthLoginStatusUrl("failed", next, "microsoft"), 302);
    }
    const idTokenClaims = decodeMicrosoftIdToken(tokenData.id_token);
    const usableIdTokenClaims = isUsableMicrosoftIdTokenClaims(
      idTokenClaims,
      bindings.MICROSOFT_OAUTH_CLIENT_ID!,
    )
      ? idTokenClaims
      : undefined;

    const infoRes = await fetcher(getMicrosoftUserInfoUrl(), {
      headers: { authorization: `Bearer ${tokenData.access_token}` },
    });
    const info = (await infoRes
      .json()
      .catch(() => null)) as MicrosoftProfileClaims | null;
    const providerUserId = info?.sub ?? usableIdTokenClaims?.sub;
    const resolvedEmail = resolveMicrosoftEmail(
      info ?? undefined,
      usableIdTokenClaims,
    );
    if (!infoRes.ok || !providerUserId || !resolvedEmail) {
      return redirect(
        getOAuthLoginStatusUrl("unverified", next, "microsoft"),
        302,
      );
    }

    const email = normalizeEmail(resolvedEmail);
    if (isPrimaryAdminEmail(email)) {
      return redirect(
        getOAuthLoginStatusUrl("conflict", next, "microsoft"),
        302,
      );
    }

    const identity = await getOAuthIdentity("microsoft", providerUserId, DB);
    let userId = identity?.userId;

    if (userId) {
      const linkedAccount = await getAccountByUserId(userId, DB);
      if (!linkedAccount) {
        return redirect(
          getOAuthLoginStatusUrl("conflict", next, "microsoft"),
          302,
        );
      }
    } else {
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
        { userId, provider: "microsoft", providerUserId, email },
        DB,
      );
      const linkedIdentity = await getOAuthIdentity(
        "microsoft",
        providerUserId,
        DB,
      );
      if (!linkedIdentity || linkedIdentity.userId !== userId) {
        return redirect(
          getOAuthLoginStatusUrl("conflict", next, "microsoft"),
          302,
        );
      }
    }

    const session = await createSession(userId, DB);
    setSessionCookie(cookies, session.token, import.meta.env.PROD);
    return redirect(next === "/" ? "/?login=success" : next, 302);
  } catch {
    return redirect(getOAuthLoginStatusUrl("failed", next, "microsoft"), 302);
  }
};
