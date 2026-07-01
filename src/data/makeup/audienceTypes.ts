// ============================================================================
// 全球妆容区域化 — 核心类型定义
// ============================================================================

/** 内容市场画像 */
export type MarketProfile =
  | "east-asia"
  | "global-english"
  | "north-america"
  | "latin-america"
  | "western-europe"
  | "global-diverse";

/** 模特呈现分组（用于参考图选择，不用于推断用户身份） */
export type RepresentationGroup =
  | "east-asian"
  | "black"
  | "latina"
  | "south-asian"
  | "middle-eastern"
  | "white"
  | "mixed"
  | "diverse-unspecified";

/** 妆容配方的技能等级 */
export type SkillLevel = "beginner" | "intermediate" | "advanced";

/** 妆容配方的对比度 */
export type Contrast = "low" | "medium" | "high";

/** 妆容配方的覆盖度 */
export type Coverage = "sheer" | "medium" | "full";

/** 配方状态 */
export type RecipeStatus = "draft" | "review" | "active" | "retired";

/** 资产审核状态 */
export type AssetQualityStatus = "draft" | "approved" | "rejected";

/** 图片主题 */
export type AssetTheme = "light" | "dark" | "neutral";

/** 图片画幅 */
export type AspectRatio = "3:4" | "4:3" | "1:1" | "16:9";

/**
 * 当前支持的 BCP 47 locale。
 * Phase 1 运行时只有 zh-CN 和 en 有完整翻译，其余预留后续扩展。
 */
export type SupportedLocale =
  | "zh-CN"
  | "en"
  | "pt-BR"
  | "es-419"
  | "de-DE"
  | "ja-JP"
  | "ko-KR"
  | "zh-TW"
  | "zh-HK"
  | "en-US"
  | "en-CA"
  | "en-GB"
  | "es-ES"
  | "pt-PT"
  | "fr-FR";

/** Audience Context 来源 */
export type AudienceContextSource =
  | "account"
  | "session"
  | "locale"
  | "fallback";

/**
 * 用户内容上下文 — 所有页面、API 和生成任务必须通过此层获取妆容与图片。
 * 禁止各页面自行写 `isEnglish ? A : B`。
 */
export interface AudienceContext {
  /** 当前界面语言 */
  locale: string;
  /** 内容市场画像 */
  marketProfile: MarketProfile;
  /** 审美偏好标签（如清透、柔雾、轮廓等） */
  beautyPreferences: string[];
  /** 模特呈现偏好（默认 ["diverse"]） */
  representationPreference: RepresentationGroup[] | ["diverse"];
  /** 上下文来源 */
  source: AudienceContextSource;
}

// ============================================================================
// 妆容配方（Look Recipe）
// ============================================================================

/** 妆容位置规范 */
export interface PlacementSpec {
  base: string[];
  eyes: string[];
  brows: string[];
  cheeks: string[];
  lips: string[];
  contour: string[];
}

/** 妆容配方 — 妆容本身的配色、位置、妆感、覆盖度和操作难度 */
export interface LookRecipe {
  id: string;
  version: string;
  status: RecipeStatus;
  palette: string[];
  placement: PlacementSpec;
  finish: string[];
  contrast: Contrast;
  coverage: Coverage;
  skillLevel: SkillLevel;
  compatibleContexts: string[];
  cautions: string[];
}

// ============================================================================
// 市场变体（Look Market Variant）
// ============================================================================

/** 妆容在某市场的运营变体 */
export interface LookMarketVariant {
  id: string;
  recipeId: string;
  marketProfiles: MarketProfile[];
  rankingWeight: number;
  scenarioTags: string[];
  trendTags: string[];
  promptAdditions: string[];
  activeFrom?: string;
  activeTo?: string;
}

// ============================================================================
// 本地化（Look Localization）
// ============================================================================

/** 顾问建议本地化 */
export interface LocalizedAdvisor {
  fit: string;
  effect: string;
  anchors: string[];
  caution: string;
  judge: string[];
}

/** 妆容本地化文案 */
export interface LookLocalization {
  marketVariantId: string;
  locale: string;
  title: string;
  summary: string;
  imageAltTemplate: string;
  scenarios: string[];
  finishLabels: string[];
  experienceLabel: string;
  advisor: LocalizedAdvisor;
}

// ============================================================================
// 资产变体（Look Asset Variant）
// ============================================================================

/** 同一妆容在不同模特、肤色深浅、主题和画幅中的参考图 */
export interface LookAssetVariant {
  id: string;
  marketVariantId: string;
  image: string;
  representationGroup: RepresentationGroup;
  skinToneBand: string;
  undertone?: string;
  theme: AssetTheme;
  aspectRatio: AspectRatio;
  focalPosition: string;
  qualityStatus: AssetQualityStatus;
  promptVersion: string;
}

// ============================================================================
// 解析后的妆容（Resolved Look）
// ============================================================================

/** 合并 recipe + marketVariant + localization + asset 后的最终妆容对象 */
export interface ResolvedLook {
  /** 配方 ID（稳定标识） */
  recipeId: string;
  /** 旧 slug（向后兼容） */
  slug: string;
  /** 市场变体 ID */
  marketVariantId: string;
  /** 当前 locale 的标题 */
  title: string;
  /** 当前 locale 的场景标签 */
  scenarios: string[];
  /** 当前 locale 的妆感标签 */
  finish: string[];
  /** 当前 locale 的难度标签 */
  experience: string;
  /** 选中的参考图路径 */
  image: string;
  /** 图片 alt 文本 */
  imageAlt: string;
  /** 妆容意图描述 */
  intent: string;
  /** 顾问建议 */
  advisor: LocalizedAdvisor;
  /** 仅用于当前界面语言搜索；中文同时包含简繁体等价文案 */
  searchTerms: string[];
  /** 排序得分 */
  score: number;
  /** 配方版本 */
  recipeVersion: string;
  /** 资产 ID */
  assetId?: string;
}

// ============================================================================
// 页面资产解析结果
// ============================================================================

/** 页面级资产（Hero、登录页人物等） */
export interface ResolvedPageAssets {
  pageId: string;
  heroImages?: { light: string; dark: string };
  heroImagesBefore?: { light: string; dark: string };
  diagnosisPreviewImage?: string;
  exampleImages?: string[];
  scenarioImages?: Record<string, string>;
  ogImage?: string;
}

// ============================================================================
// locale → marketProfile 默认映射
// ============================================================================

export const localeMarketDefaults: Record<string, MarketProfile> = {
  "zh-CN": "east-asia",
  "zh-TW": "east-asia",
  "zh-HK": "east-asia",
  "ja-JP": "east-asia",
  "ko-KR": "east-asia",
  "pt-BR": "latin-america",
  "es-419": "latin-america",
  "pt-PT": "western-europe",
  "es-ES": "western-europe",
  "de-DE": "western-europe",
  "fr-FR": "western-europe",
  "en-US": "north-america",
  "en-CA": "north-america",
  "en-GB": "western-europe",
  en: "global-english",
};

/** 当无法确定市场时的安全回退，不是"白人默认" */
export const FALLBACK_MARKET_PROFILE: MarketProfile = "global-diverse";

/** 有效的市场画像列表 */
export const validMarketProfiles: MarketProfile[] = [
  "east-asia",
  "global-english",
  "north-america",
  "latin-america",
  "western-europe",
  "global-diverse",
];

/** 校验 marketProfile 是否合法 */
export function isValidMarketProfile(value: string): value is MarketProfile {
  return validMarketProfiles.includes(value as MarketProfile);
}

/** 有效的模特呈现分组 */
export const validRepresentationGroups: RepresentationGroup[] = [
  "east-asian",
  "black",
  "latina",
  "south-asian",
  "middle-eastern",
  "white",
  "mixed",
  "diverse-unspecified",
];

/** 校验 representationGroup 是否合法 */
export function isValidRepresentationGroup(
  value: string,
): value is RepresentationGroup {
  return validRepresentationGroups.includes(value as RepresentationGroup);
}
