// ============================================================================
// 排序函数 — 根据 AudienceContext 计算妆容排序得分
// Phase 1 使用可解释加权公式，不需要机器学习。
// ============================================================================

import type { AudienceContext, MarketProfile } from "./audienceTypes";
import type { LookMarketVariant } from "./audienceTypes";
import type { LookRecipe } from "./audienceTypes";

interface RankingInput {
  recipe: LookRecipe;
  variant: LookMarketVariant;
  audienceContext: AudienceContext;
}

/**
 * Phase 1 排序公式：
 *
 * score =
 *   市场匹配度 × 0.40
 *   + 场景匹配度 × 0.25
 *   + 审美偏好 × 0.20
 *   + 变体权重 × 0.10
 *   + 多元轮换 × 0.05
 */
export function calculateScore(input: RankingInput): number {
  const { recipe, variant, audienceContext } = input;

  const marketMatch = scoreMarketMatch(
    variant.marketProfiles,
    audienceContext.marketProfile,
  );
  const scenarioMatch = scoreScenarioMatch(
    recipe.compatibleContexts,
    audienceContext.beautyPreferences,
  );
  const preferenceMatch = scorePreferenceMatch(
    recipe.finish,
    variant.trendTags,
    audienceContext.beautyPreferences,
  );
  const variantWeight = variant.rankingWeight;
  const diversityBonus = 0.5; // Phase 1 固定值

  return (
    marketMatch * 0.4 +
    scenarioMatch * 0.25 +
    preferenceMatch * 0.2 +
    normalizeWeight(variantWeight) * 0.1 +
    diversityBonus * 0.05
  );
}

/** 市场匹配度：变体的 marketProfiles 是否包含用户的 marketProfile */
function scoreMarketMatch(
  variantProfiles: MarketProfile[],
  userMarket: MarketProfile,
): number {
  // 完全匹配
  if (variantProfiles.includes(userMarket)) return 1.0;
  // global-diverse 是万能后备
  if (variantProfiles.includes("global-diverse")) return 0.5;
  // 不匹配
  return 0.2;
}

/** 场景匹配度：配方的适用场景是否与用户偏好重叠 */
function scoreScenarioMatch(contexts: string[], preferences: string[]): number {
  if (preferences.length === 0) return 0.5; // 无偏好给中间分
  const overlap = contexts.filter((c) => preferences.includes(c)).length;
  return Math.min(1.0, overlap / Math.max(1, preferences.length));
}

/** 审美偏好匹配度 */
function scorePreferenceMatch(
  finishes: string[],
  trendTags: string[],
  preferences: string[],
): number {
  if (preferences.length === 0) return 0.5;
  const allTags = [...finishes, ...trendTags];
  const lowerPrefs = preferences.map((p) => p.toLowerCase());
  const overlap = allTags.filter((t) =>
    lowerPrefs.includes(t.toLowerCase()),
  ).length;
  return Math.min(1.0, overlap / Math.max(1, lowerPrefs.length));
}

/** 归一化权重（rankingWeight 通常在 0.5-2.0） */
function normalizeWeight(weight: number): number {
  return Math.min(1.0, Math.max(0, weight / 2.0));
}

/** 按得分降序排序 */
export function sortByScore<T extends { score: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.score - a.score);
}
