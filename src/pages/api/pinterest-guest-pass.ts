import type { APIRoute } from "astro";

import { resolveCurrentUser } from "../../lib/currentUser";
import { apiError, apiSuccess } from "../../lib/http";
import {
  getOrCreatePinterestGuestPass,
  getPinterestGuestAllowance,
  getPinterestGuestGenerationLimits,
  getPinterestGuestIdentity,
  isPinterestGuestTryonParams,
  isSameOriginGuestPassRequest,
  pinterestGuestPassState,
  resolvePinterestGuestPass,
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
  deviceId?: string;
}

const GUEST_PASS_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 60 * 1000,
  maxRequests: 5,
};

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    const bindings = getRuntimeBindings();
    const { DB } = bindings;
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

    const body = (await request
      .json()
      .catch(() => null)) as GuestPassBody | null;
    const params = paramsFromBody(body);
    if (
      !isPinterestGuestTryonParams(params) ||
      !isSameOriginGuestPassRequest(request)
    ) {
      return apiError(
        {
          code: "GUEST_PASS_NOT_ELIGIBLE",
          message: "This free preview is reserved for Pinterest visitors.",
          retryable: false,
        },
        403,
      );
    }

    const limits = getPinterestGuestGenerationLimits(
      bindings.PINTEREST_GUEST_IP_DAILY_LIMIT,
      bindings.PINTEREST_GUEST_DAILY_LIMIT,
    );
    const existingPass = await resolvePinterestGuestPass(cookies, DB);
    if (existingPass) {
      const state = pinterestGuestPassState(existingPass);
      if (!state.available) {
        return apiSuccess({ authenticated: false, guestTry: state });
      }
      const allowance = await getPinterestGuestAllowance({
        DB,
        clientKeyHash: existingPass.clientKeyHash,
        deviceKeyHash: existingPass.deviceKeyHash,
        limits,
      });
      return apiSuccess({
        authenticated: false,
        guestTry: allowance.allowed
          ? state
          : unavailableState(allowance.retryAt),
      });
    }

    const identity = await getPinterestGuestIdentity(request, body?.deviceId);
    const allowance = await getPinterestGuestAllowance({
      DB,
      ...identity,
      limits,
    });
    if (!allowance.allowed) {
      return apiSuccess({
        authenticated: false,
        guestTry: unavailableState(allowance.retryAt),
      });
    }

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

    const { pass, token } = await getOrCreatePinterestGuestPass({
      cookies,
      request,
      DB,
      params,
      deviceId: body?.deviceId,
      identity,
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

function unavailableState(expiresAt: string) {
  return {
    available: false,
    used: true,
    remaining: 0 as const,
    expiresAt,
  };
}

function paramsFromBody(body: GuestPassBody | null): URLSearchParams {
  const query = body?.query ?? "";
  const trimmed = query.startsWith("?") ? query.slice(1) : query;
  return new URLSearchParams(trimmed);
}
