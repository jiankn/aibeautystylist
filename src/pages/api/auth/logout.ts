import type { APIRoute } from "astro";

import {
  AUTH_COOKIE,
  clearSessionCookie,
  revokeSession,
} from "../../../lib/authSession";
import { apiSuccess } from "../../../lib/http";
import { getRuntimeBindings } from "../../../lib/runtime";

export const POST: APIRoute = async ({ cookies }) => {
  const { DB } = getRuntimeBindings();
  const token = cookies.get(AUTH_COOKIE)?.value;
  if (DB) await revokeSession(token, DB);
  clearSessionCookie(cookies);
  return apiSuccess({ loggedOut: true });
};
