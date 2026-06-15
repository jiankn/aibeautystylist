import type { RuntimeBindings } from "./runtime";

export const GOOGLE_OAUTH_STATE_COOKIE = "abs_oauth_state";
export const GOOGLE_OAUTH_NEXT_COOKIE = "abs_oauth_next";

const FALLBACK_ORIGIN = "https://aibeautystylist.local";

export function isGoogleOAuthConfigured(bindings: RuntimeBindings): boolean {
  return Boolean(
    bindings.DB &&
    bindings.GOOGLE_OAUTH_CLIENT_ID &&
    bindings.GOOGLE_OAUTH_CLIENT_SECRET,
  );
}

export function safeAuthNextPath(value: string | null | undefined): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return "/";
  }

  try {
    const url = new URL(value, FALLBACK_ORIGIN);
    if (url.origin !== FALLBACK_ORIGIN) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

export function getGoogleOAuthCallbackUrl(
  bindings: RuntimeBindings,
  requestUrl: string,
): string {
  const requestOrigin = new URL(requestUrl).origin;
  const configuredBase = bindings.APP_PUBLIC_URL?.trim();

  try {
    const base = new URL(configuredBase || requestOrigin);
    if (base.protocol !== "https:" && base.protocol !== "http:") {
      return `${requestOrigin}/api/auth/google/callback`;
    }
    return `${base.origin}/api/auth/google/callback`;
  } catch {
    return `${requestOrigin}/api/auth/google/callback`;
  }
}

export function getOAuthLoginStatusUrl(
  status:
    | "cancelled"
    | "conflict"
    | "failed"
    | "invalid"
    | "unavailable"
    | "unverified",
  next: string,
): string {
  const params = new URLSearchParams({ oauth: status });
  const safeNext = safeAuthNextPath(next);
  if (safeNext !== "/") params.set("next", safeNext);
  return `/login?${params.toString()}`;
}
