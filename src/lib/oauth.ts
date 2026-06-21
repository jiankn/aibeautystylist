import type { RuntimeBindings } from "./runtime";

export type OAuthLoginStatus =
  | "cancelled"
  | "conflict"
  | "failed"
  | "invalid"
  | "unavailable"
  | "unverified";

export type OAuthProvider = "google" | "microsoft";

const FALLBACK_ORIGIN = "https://aibeautystylist.local";

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

export function getOAuthCallbackUrl(
  bindings: RuntimeBindings,
  requestUrl: string,
  callbackPath: `/${string}`,
): string {
  const requestOrigin = new URL(requestUrl).origin;
  const configuredBase = bindings.APP_PUBLIC_URL?.trim();

  try {
    const base = new URL(configuredBase || requestOrigin);
    if (base.protocol !== "https:" && base.protocol !== "http:") {
      return `${requestOrigin}${callbackPath}`;
    }
    return `${base.origin}${callbackPath}`;
  } catch {
    return `${requestOrigin}${callbackPath}`;
  }
}

export function getOAuthLoginStatusUrl(
  status: OAuthLoginStatus,
  next: string,
  provider?: OAuthProvider,
): string {
  const params = new URLSearchParams({ oauth: status });
  if (provider) params.set("provider", provider);
  const safeNext = safeAuthNextPath(next);
  if (safeNext !== "/") params.set("next", safeNext);
  return `/login?${params.toString()}`;
}
