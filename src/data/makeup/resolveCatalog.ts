// ============================================================================
// 目录解析器 — 合并 recipe + variant + localization + asset
// 输出 ResolvedLook[] 供所有页面和 API 使用
// ============================================================================

import type {
  AudienceContext,
  ResolvedLook,
  LookLocalization,
  LocalizedAdvisor,
} from "./audienceTypes";
import { getActiveRecipes, getRecipeById } from "./recipes";
import { getVariantById, getVariantsForRecipe } from "./marketVariants";
import { shouldUseEastAsiaAssetPack } from "./audienceProfiles";
import { zhCNLocalizations } from "./localizations/zh-CN";
import { enLocalizations } from "./localizations/en";
import { esLocalizations } from "./localizations/es";
import { deLocalizations } from "./localizations/de";
import { frLocalizations } from "./localizations/fr";
import { jaLocalizations } from "./localizations/ja";
import { koLocalizations } from "./localizations/ko";
import { ptBRLocalizations } from "./localizations/pt-BR";
import { zhTWLocalizations } from "./localizations/zh-TW";
import { getAssetById, selectBestAsset } from "./assets";
import { calculateScore, sortByScore } from "./ranking";
import { enforceLocaleAssetPack } from "./resolveAudienceContext";

/**
 * 解析妆容目录。
 *
 * 逻辑：
 * 1. 遍历所有活跃配方
 * 2. 为每个配方选择最佳市场变体（优先匹配用户 marketProfile）
 * 3. 查找当前 locale 的本地化文案（fallback: zh-CN → en → 默认生成）
 * 4. 选择最佳资产图片
 * 5. 计算排序得分
 * 6. 按得分排序返回
 */
export function resolveLookCatalog(
  audienceContext: AudienceContext,
): ResolvedLook[] {
  const effectiveAudienceContext = enforceLocaleAssetPack(audienceContext);
  const recipes = getActiveRecipes();
  const results: ResolvedLook[] = [];

  for (const recipe of recipes) {
    const variants = getVariantsForRecipe(recipe.id);
    // 选择最佳变体：优先匹配用户市场
    const variant =
      variants.find((v) =>
        v.marketProfiles.includes(effectiveAudienceContext.marketProfile),
      ) ??
      variants.find((v) => v.marketProfiles.includes("global-diverse")) ??
      variants[0];

    if (!variant) continue;

    // 查找本地化文案
    const localization = findLocalization(
      variant.id,
      effectiveAudienceContext.locale,
    );

    // 选择最佳资产
    const asset = selectBestAsset(
      variant.id,
      effectiveAudienceContext.representationPreference as string[],
    );

    // 计算排序得分
    const score = calculateScore({
      recipe,
      variant,
      audienceContext: effectiveAudienceContext,
    });

    results.push({
      recipeId: recipe.id,
      slug: recipe.id, // 向后兼容
      marketVariantId: variant.id,
      title: localization.title,
      scenarios: localization.scenarios,
      finish: localization.finishLabels,
      experience: localization.experienceLabel,
      image: asset?.image ?? `/images/look-${recipe.id}.webp`,
      imageAlt: localization.imageAltTemplate,
      intent: localization.summary,
      advisor: localization.advisor,
      score,
      recipeVersion: recipe.version,
      assetId: asset?.id,
    });
  }

  return sortByScore(results);
}

/**
 * 查找本地化文案。
 *
 * 优先级：
 * 1. 目标 locale 的指定变体文案
 * 2. 目标 locale 的 global-diverse 变体文案
 * 3. zh-CN 回退（中文始终完整）
 * 4. 自动生成默认文案
 */
function findLocalization(
  marketVariantId: string,
  locale: string,
): LookLocalization {
  const localizations = getLocalizationList(locale);
  const recipeId = marketVariantId.split("--")[0] ?? marketVariantId;

  // 尝试精确匹配
  const exact = localizations.find(
    (l) => l.marketVariantId === marketVariantId,
  );
  if (exact) return exact;

  // 尝试 global-diverse 变体
  const globalDiverse = localizations.find(
    (l) => l.marketVariantId === `${recipeId}--global-diverse`,
  );
  if (globalDiverse) return globalDiverse;

  // 回退到中文
  if (locale !== "zh-CN") {
    const zhFallback = zhCNLocalizations.find(
      (l) =>
        l.marketVariantId === marketVariantId ||
        l.marketVariantId === `${recipeId}--global-diverse`,
    );
    if (zhFallback) return zhFallback;
  }

  // 最终后备
  return createFallbackLocalization(marketVariantId, locale, recipeId);
}

/** 获取对应 locale 的本地化列表 */
function getLocalizationList(locale: string): LookLocalization[] {
  if (locale === "zh-TW" || locale === "zh-HK") return zhTWLocalizations;
  if (locale.startsWith("zh")) return zhCNLocalizations;
  if (locale.startsWith("ko")) return koLocalizations;
  if (locale.startsWith("de")) return deLocalizations;
  if (locale.startsWith("fr")) return frLocalizations;
  if (locale.startsWith("ja")) return jaLocalizations;
  if (locale.startsWith("es")) return esLocalizations;
  if (locale.startsWith("pt")) return ptBRLocalizations;
  return enLocalizations;
}

/** 自动生成默认本地化（最后手段） */
function createFallbackLocalization(
  marketVariantId: string,
  locale: string,
  recipeId: string,
): LookLocalization {
  const title = recipeId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const fallbackAdvisor: LocalizedAdvisor = {
    fit: "",
    effect: "",
    anchors: [],
    caution: "",
    judge: [],
  };

  return {
    marketVariantId,
    locale,
    title,
    summary: title,
    imageAltTemplate: `${title} makeup reference`,
    scenarios: [],
    finishLabels: [],
    experienceLabel: locale.startsWith("zh") ? "新手" : "Beginner",
    advisor: fallbackAdvisor,
  };
}

/**
 * 从旧 slug 解析到 ResolvedLook（向后兼容用）。
 * 用于 tryon-jobs API 接收旧 lookSlug 时的映射。
 */
export function resolveBySlug(
  slug: string,
  audienceContext: AudienceContext,
): ResolvedLook | undefined {
  const all = resolveLookCatalog(audienceContext);
  return all.find((look) => look.slug === slug);
}

export interface LookSnapshot {
  lookSlug: string;
  lookRecipeId?: string;
  lookRecipeVersion?: string;
  marketVariantId?: string;
  referenceAssetId?: string;
  locale?: string;
  marketProfile?: string;
}

/** 按任务快照还原妆容，供重试与历史记录使用。 */
export function resolveBySnapshot(
  snapshot: LookSnapshot,
  fallbackContext: AudienceContext,
): ResolvedLook | undefined {
  const effectiveFallbackContext = enforceLocaleAssetPack({
    ...fallbackContext,
    locale: snapshot.locale ?? fallbackContext.locale,
  });
  const recipeId = snapshot.lookRecipeId ?? snapshot.lookSlug;
  const recipe = getRecipeById(recipeId);
  if (!recipe)
    return resolveBySlug(snapshot.lookSlug, effectiveFallbackContext);

  const variant = snapshot.marketVariantId
    ? getVariantById(snapshot.marketVariantId)
    : undefined;
  if (!variant || variant.recipeId !== recipe.id) {
    return resolveBySlug(snapshot.lookSlug, effectiveFallbackContext);
  }
  if (
    shouldUseEastAsiaAssetPack(effectiveFallbackContext.locale) &&
    !variant.marketProfiles.includes("east-asia")
  ) {
    return resolveBySlug(snapshot.lookSlug, effectiveFallbackContext);
  }

  const localization = findLocalization(
    variant.id,
    snapshot.locale ?? effectiveFallbackContext.locale,
  );
  const snapshotAsset = snapshot.referenceAssetId
    ? getAssetById(snapshot.referenceAssetId)
    : undefined;
  const asset =
    snapshotAsset?.marketVariantId === variant.id
      ? snapshotAsset
      : selectBestAsset(
          variant.id,
          effectiveFallbackContext.representationPreference,
        );

  return {
    recipeId: recipe.id,
    slug: recipe.id,
    marketVariantId: variant.id,
    title: localization.title,
    scenarios: localization.scenarios,
    finish: localization.finishLabels,
    experience: localization.experienceLabel,
    image: asset?.image ?? `/images/look-${recipe.id}.webp`,
    imageAlt: localization.imageAltTemplate,
    intent: localization.summary,
    advisor: localization.advisor,
    score: 0,
    recipeVersion: snapshot.lookRecipeVersion ?? recipe.version,
    assetId: asset?.id,
  };
}
