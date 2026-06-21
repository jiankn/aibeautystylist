import type { RuntimeBindings } from "./runtime";
import { getOAuthCallbackUrl } from "./oauth";

export const MICROSOFT_OAUTH_STATE_COOKIE = "abs_ms_oauth_state";
export const MICROSOFT_OAUTH_NEXT_COOKIE = "abs_ms_oauth_next";
export const MICROSOFT_OAUTH_PKCE_COOKIE = "abs_ms_oauth_pkce";

const MICROSOFT_AUTHORITY =
  "https://login.microsoftonline.com/common/oauth2/v2.0";

export function isMicrosoftOAuthConfigured(bindings: RuntimeBindings): boolean {
  return Boolean(
    bindings.DB &&
    bindings.MICROSOFT_OAUTH_CLIENT_ID &&
    bindings.MICROSOFT_OAUTH_CLIENT_SECRET,
  );
}

export function getMicrosoftOAuthCallbackUrl(
  bindings: RuntimeBindings,
  requestUrl: string,
): string {
  return getOAuthCallbackUrl(
    bindings,
    requestUrl,
    "/api/auth/microsoft/callback",
  );
}

export function getMicrosoftAuthorizeUrl(): string {
  return `${MICROSOFT_AUTHORITY}/authorize`;
}

export function getMicrosoftTokenUrl(): string {
  return `${MICROSOFT_AUTHORITY}/token`;
}

export function getMicrosoftUserInfoUrl(): string {
  return "https://graph.microsoft.com/oidc/userinfo";
}

export async function createPkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return toBase64Url(new Uint8Array(digest));
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
