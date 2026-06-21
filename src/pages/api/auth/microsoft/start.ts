import type { APIRoute } from "astro";

import {
  getOAuthLoginStatusUrl,
  safeAuthNextPath,
} from "../../../../lib/oauth";
import {
  createPkceChallenge,
  getMicrosoftAuthorizeUrl,
  getMicrosoftOAuthCallbackUrl,
  MICROSOFT_OAUTH_NEXT_COOKIE,
  MICROSOFT_OAUTH_PKCE_COOKIE,
  MICROSOFT_OAUTH_STATE_COOKIE,
  isMicrosoftOAuthConfigured,
} from "../../../../lib/microsoftOAuth";
import { generateToken } from "../../../../lib/tokens";
import { getRuntimeBindings } from "../../../../lib/runtime";

export const GET: APIRoute = async ({ cookies, request, redirect }) => {
  const bindings = getRuntimeBindings();
  if (!isMicrosoftOAuthConfigured(bindings)) {
    return redirect(
      getOAuthLoginStatusUrl("unavailable", "/", "microsoft"),
      302,
    );
  }

  const state = generateToken(16);
  const codeVerifier = generateToken(32);
  const codeChallenge = await createPkceChallenge(codeVerifier);
  const next = safeAuthNextPath(new URL(request.url).searchParams.get("next"));
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: import.meta.env.PROD,
    path: "/",
    maxAge: 600,
  };
  cookies.set(MICROSOFT_OAUTH_STATE_COOKIE, state, cookieOptions);
  cookies.set(MICROSOFT_OAUTH_NEXT_COOKIE, next, cookieOptions);
  cookies.set(MICROSOFT_OAUTH_PKCE_COOKIE, codeVerifier, cookieOptions);

  const callbackUrl = getMicrosoftOAuthCallbackUrl(bindings, request.url);
  const params = new URLSearchParams({
    client_id: bindings.MICROSOFT_OAUTH_CLIENT_ID!,
    redirect_uri: callbackUrl,
    response_type: "code",
    response_mode: "query",
    scope: "openid email profile",
    state,
    prompt: "select_account",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return redirect(`${getMicrosoftAuthorizeUrl()}?${params.toString()}`, 302);
};
