import type { APIRoute, AstroCookies } from "astro";

import {
  COOKIE_BEAUTY_PREFERENCES,
  COOKIE_MARKET_PROFILE,
  COOKIE_REPRESENTATION_PREFERENCES,
  resolveAudienceContext,
} from "../../data/makeup/resolveAudienceContext";
import {
  getMarketProfileOptions,
  shouldUseEastAsiaAssetPack,
} from "../../data/makeup/audienceProfiles";
import { validRepresentationGroups } from "../../data/makeup/audienceTypes";
import { resolveCurrentUser } from "../../lib/currentUser";
import {
  normalizeBeautyPreferences,
  normalizeMarketProfile,
  normalizeRepresentationPreferences,
  saveUserContentPreferences,
} from "../../lib/contentPreferences";
import { apiError, apiSuccess } from "../../lib/http";
import { normalizeLocale } from "../../lib/i18n";
import { getRuntimeBindings } from "../../lib/runtime";

export const GET: APIRoute = async ({ locals }) => {
  const locale = locals.audienceContext.locale;
  return apiSuccess({
    audienceContext: locals.audienceContext,
    marketOptions: getMarketProfileOptions(locale),
    representationOptions: shouldUseEastAsiaAssetPack(locale)
      ? ["east-asian"]
      : validRepresentationGroups,
  });
};

export const POST: APIRoute = async ({ cookies, locals, request, url }) => {
  const body = (await request.json().catch(() => null)) as {
    marketProfile?: unknown;
    beautyPreferences?: unknown;
    representationPreferences?: unknown;
  } | null;
  const locale = normalizeLocale(locals.audienceContext.locale);
  const eastAsiaAssetPackLocked = shouldUseEastAsiaAssetPack(locale);
  const requestedMarketProfile = normalizeMarketProfile(body?.marketProfile);
  if (!requestedMarketProfile && !eastAsiaAssetPackLocked) {
    return apiError(
      {
        code: "INVALID_MARKET_PROFILE",
        message: "妆容灵感地区无效",
        retryable: false,
      },
      422,
    );
  }

  const marketProfile = eastAsiaAssetPackLocked
    ? "east-asia"
    : requestedMarketProfile!;
  const beautyPreferences = Object.hasOwn(body ?? {}, "beautyPreferences")
    ? normalizeBeautyPreferences(body?.beautyPreferences)
    : locals.audienceContext.beautyPreferences;
  const representationPreferences = eastAsiaAssetPackLocked
    ? normalizeRepresentationPreferences(["east-asian"])
    : Object.hasOwn(body ?? {}, "representationPreferences")
      ? normalizeRepresentationPreferences(body?.representationPreferences)
      : locals.audienceContext.representationPreference;
  const secure = url.protocol === "https:";
  setPreferenceCookie(cookies, COOKIE_MARKET_PROFILE, marketProfile, secure);
  setPreferenceCookie(
    cookies,
    COOKIE_BEAUTY_PREFERENCES,
    encodeURIComponent(JSON.stringify(beautyPreferences)),
    secure,
  );
  setPreferenceCookie(
    cookies,
    COOKIE_REPRESENTATION_PREFERENCES,
    encodeURIComponent(JSON.stringify(representationPreferences)),
    secure,
  );

  const { DB } = getRuntimeBindings();
  const user = await resolveCurrentUser(cookies, DB);
  if (user.authenticated && DB) {
    await saveUserContentPreferences(
      user.id,
      {
        locale,
        marketProfile,
        beautyPreferences,
        representationPreferences,
        source: "account",
      },
      DB,
    );
  }

  return apiSuccess({
    audienceContext: resolveAudienceContext(
      locale,
      cookies,
      user.authenticated
        ? {
            marketProfile,
            beautyPreferences,
            representationPreferences,
          }
        : undefined,
    ),
    persistedToAccount: user.authenticated,
  });
};

function setPreferenceCookie(
  cookies: AstroCookies,
  name: string,
  value: string,
  secure: boolean,
): void {
  cookies.set(name, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure,
  });
}
