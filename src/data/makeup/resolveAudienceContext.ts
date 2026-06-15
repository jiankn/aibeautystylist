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
import {
  getDefaultMarketProfile,
  shouldUseEastAsiaAssetPack,
} from "./audienceProfiles";

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
 * 东亚语言是产品级视觉锁定规则，不允许旧 Cookie、账号偏好或手工 context
 * 让简中、繁中、日语、韩语页面回退到非东亚人物资产。
 */
export function enforceLocaleAssetPack(
  audienceContext: AudienceContext,
): AudienceContext {
  if (!shouldUseEastAsiaAssetPack(audienceContext.locale)) {
    return audienceContext;
  }

  return {
    ...audienceContext,
    marketProfile: "east-asia",
    representationPreference: ["east-asian"],
    source: "locale",
  };
}

/**
 * 解析用户的 Audience Context。
 *
 * 优先级（从高到低）：
 * 1. 东亚语言视觉资产包锁定
 * 2. 用户账户中保存的偏好
 * 3. Cookie 中的会话偏好
 * 4. 带地区的 BCP 47 locale
 * 5. 仅语言 locale
 * 6. global-diverse 回退
 */
export function resolveAudienceContext(
  locale: string,
  cookies?: CookieReader,
  userPreferences?: UserContentPreferences,
): AudienceContext {
  if (shouldUseEastAsiaAssetPack(locale)) {
    const accountBeautyPreferences = normalizeStringArray(
      userPreferences?.beautyPreferences,
    );
    const sessionBeautyPreferences = parseCookieArray(
      cookies?.get(COOKIE_BEAUTY_PREFERENCES)?.value,
    );

    return enforceLocaleAssetPack({
      locale,
      marketProfile: "east-asia",
      beautyPreferences:
        accountBeautyPreferences.length > 0
          ? accountBeautyPreferences
          : sessionBeautyPreferences,
      representationPreference: ["east-asian"],
      source: "locale",
    });
  }

  // 2. 优先使用账户偏好
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

  // 3. 尝试从 Cookie 获取
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

  // 4-5. 根据 locale 推断
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

  // 6. 安全回退
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
