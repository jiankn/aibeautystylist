// ============================================================================
// 市场变体数据 — 每个妆容在不同市场的运营变体
// 东亚市场已扩展到完整 44 个妆容；全球英文保留首批高意图妆容专属变体。
// ============================================================================

import type { LookMarketVariant, MarketProfile } from "./audienceTypes";

/** Phase 1 的 8 个核心配方 ID */
export const pilotRecipeIds = [
  "beginner",
  "commute",
  "date",
  "five-minute-beginner",
  "interview-ready",
  "no-makeup",
  "photogenic",
  "rose-milk-date",
] as const;

/** 当前线上目录的全部 44 个妆容配方 ID。 */
export const allRecipeIds = [
  "beginner",
  "bronze-evening",
  "burgundy-velvet",
  "candlelight-mauve",
  "champagne-gala",
  "client-meeting-nude",
  "cloud-skin-matte",
  "commute",
  "creator-camera-glow",
  "date",
  "douyin-soft-focus",
  "evening",
  "executive-rose",
  "five-minute-beginner",
  "flash-proof-satin",
  "french-natural-chic",
  "hooded-eyes-lift",
  "interview-ready",
  "jelly-lip-tint",
  "korean-dewy-glow",
  "korean-dewy-makeup",
  "latina-bronze-glam",
  "mature-skin-radiance",
  "monolid-makeup",
  "no-makeup",
  "olive-undertone-rose",
  "passport-photo-clean",
  "peach-beige-date",
  "peach-morning-glow",
  "photogenic",
  "refined",
  "reflective-lid-glow",
  "romantic-pink",
  "rose-milk-date",
  "soft-berry-stain",
  "soft-editorial",
  "soft-matte-everyday",
  "summer-wedding-guest",
  "sunburn-satin-glow",
  "vacation-bronze",
  "warm-nude-daily",
  "watercolor-blush",
  "wedding-guest",
  "weekend-glow",
] as const;

export const eastAsiaRecipeIds = allRecipeIds;

/**
 * 全部市场变体。
 *
 * 命名规则：`{recipeId}--{marketProfile}`
 * 如 `commute--east-asia`、`commute--global-diverse`
 */
export const marketVariants: LookMarketVariant[] = buildAllVariants();

function buildAllVariants(): LookMarketVariant[] {
  const variants: LookMarketVariant[] = [];

  for (const recipeId of allRecipeIds) {
    const isPilot = (pilotRecipeIds as readonly string[]).includes(recipeId);

    // 所有配方都有 global-diverse 变体
    variants.push({
      id: `${recipeId}--global-diverse`,
      recipeId,
      marketProfiles: ["global-diverse"],
      rankingWeight: 1.0,
      scenarioTags: [],
      trendTags: [],
      promptAdditions: [],
    });

    // 东亚语言（简中、繁中、日、韩）全部使用专属视觉/妆容变体。
    variants.push({
      id: `${recipeId}--east-asia`,
      recipeId,
      marketProfiles: ["east-asia"],
      rankingWeight: eastAsiaRankingWeight(recipeId),
      scenarioTags: [],
      trendTags: eastAsiaTrendTags(recipeId),
      promptAdditions: [],
    });

    if (isPilot) {
      // 核心配方有 global-english 变体。
      variants.push({
        id: `${recipeId}--global-english`,
        recipeId,
        marketProfiles: ["global-english", "north-america"],
        rankingWeight: 1.3,
        scenarioTags: [],
        trendTags: globalEnglishTrendTags(recipeId),
        promptAdditions: [],
      });
    }
  }

  return variants;
}

/** 东亚市场趋势标签 */
function eastAsiaTrendTags(recipeId: string): string[] {
  const map: Record<string, string[]> = {
    beginner: ["新手友好", "日系清透"],
    "burgundy-velvet": ["酒红丝绒", "精致约会"],
    "client-meeting-nude": ["职场裸妆", "干净专业"],
    commute: ["通勤首选", "快速出门"],
    date: ["约会感", "甜系"],
    "douyin-soft-focus": ["柔焦感", "社媒上镜"],
    "hooded-eyes-lift": ["内双友好", "眼型提升"],
    "jelly-lip-tint": ["果冻唇", "元气感"],
    "korean-dewy-glow": ["韩系水光", "玻璃肌"],
    "korean-dewy-makeup": ["韩系清透", "水润底妆"],
    "five-minute-beginner": ["5分钟出门", "极简"],
    "monolid-makeup": ["单眼皮友好", "自然放大"],
    "passport-photo-clean": ["证件照友好", "干净显气色"],
    "peach-morning-glow": ["蜜桃晨光", "低负担"],
    "rose-milk-date": ["玫瑰奶茶", "温柔约会"],
    "soft-berry-stain": ["浆果唇", "果汁感"],
    "sunburn-satin-glow": ["晒伤腮红", "缎光"],
    "champagne-gala": ["年会妆", "宴会"],
    "flash-proof-satin": ["闪光灯", "上镜"],
  };
  return map[recipeId] ?? [];
}

function eastAsiaRankingWeight(recipeId: string): number {
  const highIntent = new Set<string>([
    "commute",
    "date",
    "douyin-soft-focus",
    "hooded-eyes-lift",
    "jelly-lip-tint",
    "korean-dewy-glow",
    "korean-dewy-makeup",
    "monolid-makeup",
    "passport-photo-clean",
    "rose-milk-date",
  ]);
  return highIntent.has(recipeId) ? 1.7 : 1.5;
}

/** 全球英文市场趋势标签 */
function globalEnglishTrendTags(recipeId: string): string[] {
  const map: Record<string, string[]> = {
    beginner: ["no-makeup makeup", "natural beauty"],
    commute: ["everyday glow", "office ready"],
    date: ["soft glam", "romantic"],
    "korean-dewy-glow": ["glass skin", "K-beauty"],
    "five-minute-beginner": ["5-minute face", "minimal"],
    "soft-berry-stain": ["berry lip", "fresh face"],
    "champagne-gala": ["champagne glam", "evening"],
    "flash-proof-satin": ["camera ready", "flash-proof"],
  };
  return map[recipeId] ?? [];
}

/** 按 variantId 查找 */
export function getVariantById(id: string): LookMarketVariant | undefined {
  return marketVariants.find((v) => v.id === id);
}

/** 按 recipeId 查找所有变体 */
export function getVariantsForRecipe(recipeId: string): LookMarketVariant[] {
  return marketVariants.filter((v) => v.recipeId === recipeId);
}

/** 按 marketProfile 查找所有变体 */
export function getVariantsForMarket(
  marketProfile: MarketProfile,
): LookMarketVariant[] {
  return marketVariants.filter((v) => v.marketProfiles.includes(marketProfile));
}
