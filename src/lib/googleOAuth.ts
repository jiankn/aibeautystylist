import type { RuntimeBindings } from "./runtime";
import {
  getOAuthCallbackUrl,
  getOAuthLoginStatusUrl,
  safeAuthNextPath,
  type OAuthLoginStatus,
} from "./oauth";

export const GOOGLE_OAUTH_STATE_COOKIE = "abs_oauth_state";
export const GOOGLE_OAUTH_NEXT_COOKIE = "abs_oauth_next";

export { getOAuthLoginStatusUrl, safeAuthNextPath };

export function isGoogleOAuthConfigured(bindings: RuntimeBindings): boolean {
  return Boolean(
    bindings.DB &&
    bindings.GOOGLE_OAUTH_CLIENT_ID &&
    bindings.GOOGLE_OAUTH_CLIENT_SECRET,
  );
}

export function getGoogleOAuthCallbackUrl(
  bindings: RuntimeBindings,
  requestUrl: string,
): string {
  return getOAuthCallbackUrl(bindings, requestUrl, "/api/auth/google/callback");
}

export function getGoogleOAuthLoginStatusUrl(
  status: OAuthLoginStatus,
  next: string,
): string {
  return getOAuthLoginStatusUrl(status, next);
}
