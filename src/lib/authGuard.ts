import type { AstroCookies } from "astro";

import { resolveCurrentUser, type CurrentUser } from "./currentUser";
import { apiError } from "./http";
import type { D1DatabaseLike } from "./runtime";

export interface AuthenticatedUserResult {
  ok: true;
  user: CurrentUser;
}

export interface AuthRequiredResult {
  ok: false;
  response: Response;
}

export type RequireAuthenticatedUserResult =
  | AuthenticatedUserResult
  | AuthRequiredResult;

export async function requireAuthenticatedUser(
  cookies: AstroCookies,
  DB?: D1DatabaseLike,
): Promise<RequireAuthenticatedUserResult> {
  const user = await resolveCurrentUser(cookies, DB);
  if (user.authenticated) return { ok: true, user };

  return {
    ok: false,
    response: apiError(
      {
        code: "AUTH_REQUIRED",
        message: "请先登录后再继续",
        retryable: false,
      },
      401,
    ),
  };
}
