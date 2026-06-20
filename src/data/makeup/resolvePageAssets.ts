// ============================================================================
// 页面资产解析器 — 统一管理首页 Hero、登录页人物等页面级资产
// ============================================================================

import type {
  AudienceContext,
  RepresentationGroup,
  ResolvedPageAssets,
} from "./audienceTypes";

function prefersRepresentation(
  audienceContext: AudienceContext,
  representation: RepresentationGroup,
): boolean {
  return audienceContext.representationPreference.some(
    (preference) => preference === representation,
  );
}

function resolveRegionalProfile(audienceContext: AudienceContext) {
  if (
    audienceContext.marketProfile === "east-asia" ||
    prefersRepresentation(audienceContext, "east-asian")
  ) {
    return "east-asia";
  }
  if (prefersRepresentation(audienceContext, "black")) return "africa";
  if (prefersRepresentation(audienceContext, "south-asian")) {
    return "south-asia";
  }
  return "global";
}

function isEastAsianLocale(locale: string): boolean {
  const language = locale.split("-")[0]?.toLowerCase();
  return language === "zh" || language === "ja" || language === "ko";
}

/** 解析页面级资产，页面自身不再按语言或地区硬编码图片。 */
export function resolvePageAssets(
  pageId: string,
  audienceContext: AudienceContext,
): ResolvedPageAssets {
  const regionalProfile = resolveRegionalProfile(audienceContext);
  const isEastAsia =
    isEastAsianLocale(audienceContext.locale) &&
    regionalProfile === "east-asia";

  switch (pageId) {
    case "home":
      return {
        pageId,
        heroImages: {
          light: isEastAsia
            ? "/images/look-korean-dewy-makeup.webp"
            : "/images/home-hero-global-commute-after.webp",
          dark: isEastAsia
            ? "/images/look-korean-dewy-makeup.webp"
            : "/images/home-hero-global-commute-after.webp",
        },
        heroImagesBefore: {
          light: isEastAsia
            ? "/images/look-korean-dewy-makeup-before.webp"
            : "/images/home-hero-global-commute-before.webp",
          dark: isEastAsia
            ? "/images/look-korean-dewy-makeup-before.webp"
            : "/images/home-hero-global-commute-before.webp",
        },
        diagnosisPreviewImage: isEastAsia
          ? "/images/diagnosis-preview.webp"
          : "/images/diagnosis-preview-global.webp",
        exampleImages: [
          "/homepage-look-champagne-gala.webp",
          "/homepage-look-commute.webp",
          "/homepage-look-date.webp",
          "/homepage-look-korean-dewy-glow.webp",
          "/homepage-look-five-minute-beginner.webp",
          "/homepage-look-flash-proof-satin.webp",
        ],
        scenarioImages: {
          commute: isEastAsia
            ? "/images/home-scenario-commute-east-asia.webp"
            : "/images/home-scenario-commute-global.webp",
          "interview-ready": isEastAsia
            ? "/images/home-scenario-interview-east-asia.webp"
            : "/images/home-scenario-interview-global.webp",
          "rose-milk-date": isEastAsia
            ? "/images/home-scenario-date-east-asia.webp"
            : "/images/home-scenario-date-global.webp",
        },
      };

    case "login":
      return {
        pageId,
        heroImages: {
          light: isEastAsia
            ? "/images/login-hero-east-asia-light.webp"
            : "/images/login-hero-global-light.webp",
          dark: isEastAsia
            ? "/images/login-hero-east-asia-dark.webp"
            : "/images/login-hero-global-dark.webp",
        },
      };

    case "diagnosis":
      return {
        pageId,
        exampleImages: [
          isEastAsia
            ? "/images/diagnosis-preview-full-face.webp"
            : "/images/diagnosis-preview-global.webp",
        ],
      };

    default:
      return { pageId };
  }
}
