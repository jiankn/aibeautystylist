import type { APIRoute } from "astro";

import {
  getGoogleOAuthCallbackUrl,
  GOOGLE_OAUTH_NEXT_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
  isGoogleOAuthConfigured,
  safeAuthNextPath,
} from "../../../../lib/googleOAuth";
import { generateToken } from "../../../../lib/tokens";
import { getRuntimeBindings } from "../../../../lib/runtime";

// 跳转到 Google OAuth 同意页。用一次性 state（存 httpOnly cookie）防 CSRF。
export const GET: APIRoute = async ({ cookies, request, redirect }) => {
  const bindings = getRuntimeBindings();
  if (!isGoogleOAuthConfigured(bindings)) {
    return redirect("/login?oauth=unavailable", 302);
  }

  const state = generateToken(16);
  const next = safeAuthNextPath(new URL(request.url).searchParams.get("next"));
  cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    path: "/",
    maxAge: 600,
  });
  cookies.set(GOOGLE_OAUTH_NEXT_COOKIE, next, {
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    path: "/",
    maxAge: 600,
  });

  const callbackUrl = getGoogleOAuthCallbackUrl(bindings, request.url);
  const params = new URLSearchParams({
    client_id: bindings.GOOGLE_OAUTH_CLIENT_ID!,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
    include_granted_scopes: "true",
  });
  return redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    302,
  );
};
