// ============================================================================
// Audience Context 解析器
// 统一入口，禁止各页面自行写 isEnglish ? A : B
// ============================================================================

import type { AudienceContext, RepresentationGroup } from "./audienceTypes";
import {
  isValidMarketProfile,
  isValidRepresentationGroup,
  FALLBACK_MARKET_PROFILE,
} from "./audienceTypes";
import { getDefaultMarketProfile } from "./audienceProfiles";

/** Cookie 名称常量 */
export const COOKIE_MARKET_PROFILE = "abs_market_profile";
export const COOKIE_BEAUTY_PREFERENCES = "abs_beauty_preferences";
export const COOKIE_REPRESENTATION_PREFERENCES =
  "abs_representation_preferences";

interface CookieReader {
  get(name: string): { value: string } | undefined;
}

export interface UserContentPreferences {
  marketProfile?: string;
  beautyPreferences?: string[];
  representationPreferences?: string[];
}

/**
 * 解析用户的 Audience Context。
 *
 * 优先级（从高到低）：
 * 1. 用户账户中保存的偏好
 * 2. Cookie 中的会话偏好
 * 3. 带地区的 BCP 47 locale
 * 4. 仅语言 locale
 * 5. global-diverse 回退
 */
export function resolveAudienceContext(
  locale: string,
  cookies?: CookieReader,
  userPreferences?: UserContentPreferences,
): AudienceContext {
  // 1. 优先使用账户偏好
  if (userPreferences?.marketProfile) {
    const mp = userPreferences.marketProfile;
    if (isValidMarketProfile(mp)) {
      return {
        locale,
        marketProfile: mp,
        beautyPreferences: normalizeStringArray(
          userPreferences.beautyPreferences,
        ),
        representationPreference: normalizeRepresentationPreferences(
          userPreferences.representationPreferences,
        ),
        source: "account",
      };
    }
  }

  // 2. 尝试从 Cookie 获取
  if (cookies) {
    const cookieMarket = cookies.get(COOKIE_MARKET_PROFILE)?.value;
    if (cookieMarket && isValidMarketProfile(cookieMarket)) {
      const beautyPrefCookie = cookies.get(COOKIE_BEAUTY_PREFERENCES)?.value;
      const reprPrefCookie = cookies.get(
        COOKIE_REPRESENTATION_PREFERENCES,
      )?.value;

      return {
        locale,
        marketProfile: cookieMarket,
        beautyPreferences: parseCookieArray(beautyPrefCookie),
        representationPreference: normalizeRepresentationPreferences(
          parseCookieArray(reprPrefCookie),
        ),
        source: "session",
      };
    }
  }

  // 3-4. 根据 locale 推断
  const defaultMarket = getDefaultMarketProfile(locale);
  if (defaultMarket !== FALLBACK_MARKET_PROFILE) {
    return {
      locale,
      marketProfile: defaultMarket,
      beautyPreferences: [],
      representationPreference: ["diverse"],
      source: "locale",
    };
  }

  // 5. 安全回退
  return {
    locale,
    marketProfile: FALLBACK_MARKET_PROFILE,
    beautyPreferences: [],
    representationPreference: ["diverse"],
    source: "fallback",
  };
}

/** 解析 Cookie 中的 JSON 数组 */
function parseCookieArray(value?: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
}

function normalizeRepresentationPreferences(
  value: unknown,
): RepresentationGroup[] | ["diverse"] {
  const items = normalizeStringArray(value);
  if (items.length === 0 || items.includes("diverse")) return ["diverse"];
  const valid = items.filter(isValidRepresentationGroup);
  return valid.length > 0 ? [...new Set(valid)] : ["diverse"];
}
