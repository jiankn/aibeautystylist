import type { RuntimeBindings } from "./runtime";
import { getOAuthCallbackUrl } from "./oauth";

export const MICROSOFT_OAUTH_STATE_COOKIE = "abs_ms_oauth_state";
export const MICROSOFT_OAUTH_NEXT_COOKIE = "abs_ms_oauth_next";
export const MICROSOFT_OAUTH_PKCE_COOKIE = "abs_ms_oauth_pkce";

const MICROSOFT_AUTHORITY =
  "https://login.microsoftonline.com/common/oauth2/v2.0";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface MicrosoftProfileClaims {
  sub?: string;
  email?: string;
  preferred_username?: string;
}

export interface MicrosoftIdTokenClaims extends MicrosoftProfileClaims {
  aud?: string;
  exp?: number;
}

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

export function decodeMicrosoftIdToken(
  token: string | undefined,
): MicrosoftIdTokenClaims | undefined {
  const payload = token?.split(".")[1];
  if (!payload) return undefined;

  try {
    const json = decodeBase64Url(payload);
    const claims = JSON.parse(json) as unknown;
    if (!claims || typeof claims !== "object" || Array.isArray(claims)) {
      return undefined;
    }
    return claims as MicrosoftIdTokenClaims;
  } catch {
    return undefined;
  }
}

export function isUsableMicrosoftIdTokenClaims(
  claims: MicrosoftIdTokenClaims | undefined,
  clientId: string,
  now = new Date(),
): claims is MicrosoftIdTokenClaims {
  return Boolean(
    claims &&
    claims.aud === clientId &&
    typeof claims.exp === "number" &&
    claims.exp * 1000 > now.getTime(),
  );
}

export function resolveMicrosoftEmail(
  userInfo: MicrosoftProfileClaims | undefined,
  idTokenClaims: MicrosoftProfileClaims | undefined,
): string | undefined {
  const candidates = [
    userInfo?.email,
    idTokenClaims?.email,
    idTokenClaims?.preferred_username,
  ];
  return candidates.find((value) => Boolean(value && EMAIL_RE.test(value)));
}

export async function createPkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return toBase64Url(new Uint8Array(digest));
}

function decodeBase64Url(value: string): string {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new TextDecoder().decode(bytes);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
