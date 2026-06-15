// ============================================================================
// 市场画像配置 — locale → marketProfile 映射与画像描述
// ============================================================================

import type { MarketProfile } from "./audienceTypes";
import { localeMarketDefaults, FALLBACK_MARKET_PROFILE } from "./audienceTypes";

/** 市场画像元数据 */
export interface MarketProfileMeta {
  id: MarketProfile;
  /** 中文名称 */
  labelZh: string;
  /** 英文名称 */
  labelEn: string;
  /** 中文描述 */
  descriptionZh: string;
  /** 英文描述 */
  descriptionEn: string;
}

/** 市场画像配置表 */
export const marketProfileMetas: MarketProfileMeta[] = [
  {
    id: "east-asia",
    labelZh: "东亚灵感",
    labelEn: "East Asian Inspiration",
    descriptionZh:
      "优先清透底妆、柔雾、低饱和、单眼皮或内双可见区、日常通勤和本地活动场景",
    descriptionEn:
      "Prioritizes sheer base, soft matte, low saturation, monolid-friendly techniques, and daily/commute scenarios",
  },
  {
    id: "global-english",
    labelZh: "全球多元",
    labelEn: "Global Diverse",
    descriptionZh: "多元风格混排，不默认白人优先",
    descriptionEn: "Diverse style mix, no single-ethnicity default",
  },
  {
    id: "north-america",
    labelZh: "北美灵感",
    labelEn: "North American Inspiration",
    descriptionZh: "日常、Clean、Soft Glam、Camera-ready、活动妆并重",
    descriptionEn:
      "Balanced everyday, clean, soft glam, camera-ready, and event looks",
  },
  {
    id: "latin-america",
    labelZh: "拉丁美洲灵感",
    labelEn: "Latin American Inspiration",
    descriptionZh: "暖调、轮廓、光泽、活动与高温高湿持妆方向",
    descriptionEn:
      "Warm tones, contouring, luminous finish, event and humidity-proof options",
  },
  {
    id: "western-europe",
    labelZh: "欧洲编辑感",
    labelEn: "European Editorial",
    descriptionZh: "自然、精致、法式松弛、编辑感、通勤和晚宴",
    descriptionEn:
      "Natural, refined, French effortless, editorial, commute and evening",
  },
  {
    id: "global-diverse",
    labelZh: "混合推荐",
    labelEn: "Mixed Recommendations",
    descriptionZh: "综合所有地区的妆容灵感",
    descriptionEn: "A blend of beauty inspiration from all regions",
  },
];

const localizedProfileLabels: Record<
  string,
  Partial<Record<MarketProfile, string>>
> = {
  de: {
    "east-asia": "Ostasiatische Inspiration",
    "global-english": "Globale Vielfalt",
    "north-america": "Nordamerikanische Inspiration",
    "latin-america": "Lateinamerikanische Inspiration",
    "western-europe": "Europäischer Editorial Look",
    "global-diverse": "Gemischte Empfehlungen",
  },
  fr: {
    "east-asia": "Inspiration est-asiatique",
    "global-english": "Diversité mondiale",
    "north-america": "Inspiration nord-américaine",
    "latin-america": "Inspiration latino-américaine",
    "western-europe": "Éditorial européen",
    "global-diverse": "Recommandations mixtes",
  },
  ja: {
    "east-asia": "東アジアのメイク",
    "global-english": "グローバルなメイク",
    "north-america": "北米のメイク",
    "latin-america": "ラテンアメリカのメイク",
    "western-europe": "ヨーロッパのエディトリアルメイク",
    "global-diverse": "ミックスおすすめ",
  },
  ko: {
    "east-asia": "동아시아 메이크업",
    "global-english": "글로벌 메이크업",
    "north-america": "북미 메이크업",
    "latin-america": "라틴아메리카 메이크업",
    "western-europe": "유럽 에디토리얼 메이크업",
    "global-diverse": "혼합 추천",
  },
  "zh-TW": {
    "east-asia": "東亞妝容靈感",
    "global-english": "全球多元妝容",
    "north-america": "北美妝容靈感",
    "latin-america": "拉丁美洲妝容靈感",
    "western-europe": "歐洲編輯感妝容",
    "global-diverse": "綜合推薦",
  },
  es: {
    "east-asia": "Inspiración de Asia oriental",
    "global-english": "Diversidad global",
    "north-america": "Inspiración norteamericana",
    "latin-america": "Inspiración latinoamericana",
    "western-europe": "Editorial europeo",
    "global-diverse": "Recomendaciones mixtas",
  },
  pt: {
    "east-asia": "Inspiração do Leste Asiático",
    "global-english": "Diversidade global",
    "north-america": "Inspiração norte-americana",
    "latin-america": "Inspiração latino-americana",
    "western-europe": "Editorial europeu",
    "global-diverse": "Recomendações mistas",
  },
};

function getLocalizedProfileLabel(
  profile: MarketProfile,
  locale: string,
): string | undefined {
  return (
    localizedProfileLabels[locale]?.[profile] ??
    localizedProfileLabels[locale.split("-")[0]?.toLowerCase() ?? ""]?.[profile]
  );
}

/** 根据 locale 获取默认 marketProfile */
export function getDefaultMarketProfile(locale: string): MarketProfile {
  // 先精确匹配
  if (locale in localeMarketDefaults) {
    return localeMarketDefaults[locale];
  }

  // 再尝试只匹配语言码（如 "en-AU" → "en"）
  const lang = locale.split("-")[0]?.toLowerCase();
  if (lang && lang in localeMarketDefaults) {
    return localeMarketDefaults[lang];
  }

  return FALLBACK_MARKET_PROFILE;
}

/** 简中、繁中、日语、韩语始终使用东亚视觉与妆容资产包。 */
export function shouldUseEastAsiaAssetPack(locale: string): boolean {
  return getDefaultMarketProfile(locale) === "east-asia";
}

/** 获取市场画像的本地化名称 */
export function getMarketProfileLabel(
  profile: MarketProfile,
  locale: string,
): string {
  const meta = marketProfileMetas.find((m) => m.id === profile);
  if (!meta) return profile;
  const localizedLabel = getLocalizedProfileLabel(profile, locale);
  if (localizedLabel) return localizedLabel;
  return locale.startsWith("zh") ? meta.labelZh : meta.labelEn;
}

/** 获取所有市场画像选项（用于 UI 选择器） */
export function getMarketProfileOptions(
  locale: string,
): Array<{ value: MarketProfile; label: string }> {
  const availableProfiles = shouldUseEastAsiaAssetPack(locale)
    ? marketProfileMetas.filter((meta) => meta.id === "east-asia")
    : marketProfileMetas;

  return availableProfiles.map((meta) => ({
    value: meta.id,
    label:
      getLocalizedProfileLabel(meta.id, locale) ??
      (locale.startsWith("zh") ? meta.labelZh : meta.labelEn),
  }));
}
