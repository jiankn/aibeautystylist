import type { APIRoute } from "astro";

import { resolveCurrentUser } from "../../lib/currentUser";
import { apiError, apiSuccess } from "../../lib/http";
import {
  getOrCreatePinterestGuestPass,
  isPinterestGuestTryonParams,
  PINTEREST_GUEST_COOKIE,
  pinterestGuestPassState,
  setPinterestGuestCookie,
} from "../../lib/pinterestGuestPass";
import {
  checkRateLimit,
  getClientIp,
  type RateLimitConfig,
} from "../../lib/rateLimit";
import { getRuntimeBindings } from "../../lib/runtime";

interface GuestPassBody {
  query?: string;
}

const GUEST_PASS_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 60 * 1000,
  maxRequests: 5,
};

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    const { DB } = getRuntimeBindings();
    if (!DB) {
      return apiError(
        {
          code: "GUEST_PASS_UNAVAILABLE",
          message: "Guest try-on is temporarily unavailable.",
          retryable: true,
        },
        503,
      );
    }

    const user = await resolveCurrentUser(cookies, DB);
    if (user.authenticated) {
      return apiSuccess({
        authenticated: true,
        guestTry: null,
      });
    }

    const body = (await request.json().catch(() => null)) as
      | GuestPassBody
      | null;
    const params = paramsFromBody(body);
    if (!isPinterestGuestTryonParams(params)) {
      return apiError(
        {
          code: "GUEST_PASS_NOT_ELIGIBLE",
          message: "This free preview is reserved for Pinterest visitors.",
          retryable: false,
        },
        403,
      );
    }

    const existingCookie = cookies.get(PINTEREST_GUEST_COOKIE)?.value;
    if (!existingCookie) {
      const ip = getClientIp(request);
      const rateLimit = await checkRateLimit(
        `pinterest-guest:${ip}`,
        GUEST_PASS_RATE_LIMIT,
        DB,
      );
      if (!rateLimit.allowed) {
        return apiError(
          {
            code: "GUEST_PASS_RATE_LIMITED",
            message: "Too many free preview requests. Please try again later.",
            retryable: true,
          },
          429,
        );
      }
    }

    const { pass, token } = await getOrCreatePinterestGuestPass({
      cookies,
      request,
      DB,
      params,
    });
    if (token) setPinterestGuestCookie(cookies, token, import.meta.env.PROD);

    return apiSuccess({
      authenticated: false,
      guestTry: pinterestGuestPassState(pass),
    });
  } catch (error) {
    console.error("Pinterest guest pass failed", error);
    return apiError(
      {
        code: "GUEST_PASS_UNAVAILABLE",
        message: "Guest try-on is temporarily unavailable.",
        retryable: true,
      },
      503,
    );
  }
};

function paramsFromBody(body: GuestPassBody | null): URLSearchParams {
  const query = body?.query ?? "";
  const trimmed = query.startsWith("?") ? query.slice(1) : query;
  return new URLSearchParams(trimmed);
}
