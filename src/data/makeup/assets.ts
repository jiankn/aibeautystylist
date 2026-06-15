// ============================================================================
// 资产变体层 — 将 44 个妆容映射到全球默认图、东亚本地化图和补充多元图。
// ============================================================================

import type { LookAssetVariant, RepresentationGroup } from "./audienceTypes";
import { allRecipeIds, pilotRecipeIds } from "./marketVariants";

/**
 * 将现有 44 个妆容图片映射为默认资产变体。
 * 每个妆容至少有一个 `global-diverse` 变体下的默认资产。
 */
export const assets: LookAssetVariant[] = buildDefaultAssets();

function buildDefaultAssets(): LookAssetVariant[] {
  const defaultAssets = allRecipeIds.map((slug) => ({
    id: `${slug}--default`,
    marketVariantId: `${slug}--global-diverse`,
    image: `/images/look-${slug}.webp`,
    representationGroup: "diverse-unspecified" as const,
    skinToneBand: "unspecified",
    theme: "neutral" as const,
    aspectRatio: "3:4" as const,
    focalPosition: "center" as const,
    qualityStatus: "approved" as const,
    promptVersion: "legacy-1.0",
  }));

  const eastAsiaAssets = allRecipeIds.map((slug) => ({
    id: `${slug}--east-asia`,
    marketVariantId: `${slug}--east-asia`,
    image: `/images/looks/${slug}--east-asia.webp`,
    representationGroup: "east-asian" as const,
    skinToneBand: "unspecified",
    theme: "neutral" as const,
    aspectRatio: "1:1" as const,
    focalPosition: "center" as const,
    qualityStatus: "approved" as const,
    promptVersion: "east-asia-v3",
  }));

  const globalEnglishAssetProfiles: Array<{
    fileSuffix: string;
    representationGroup: RepresentationGroup;
  }> = [
    {
      fileSuffix: "south-asia",
      representationGroup: "south-asian",
    },
    {
      fileSuffix: "africa",
      representationGroup: "black",
    },
  ];

  const globalEnglishAssets: LookAssetVariant[] = [];
  pilotRecipeIds.forEach((slug) => {
    globalEnglishAssetProfiles.forEach(
      ({ fileSuffix, representationGroup }) => {
        globalEnglishAssets.push({
          id: `${slug}--${fileSuffix}`,
          marketVariantId: `${slug}--global-english`,
          image: `/images/looks/${slug}--${fileSuffix}.webp`,
          representationGroup,
          skinToneBand: "unspecified",
          theme: "neutral" as const,
          aspectRatio: "1:1" as const,
          focalPosition: "center",
          qualityStatus: "approved" as const,
          promptVersion: "v2-high-res",
        });
      },
    );
  });

  const globalDiverseGeneratedAssets = [
    {
      slug: "client-meeting-nude",
      representationGroup: "black",
    },
    {
      slug: "date",
      representationGroup: "latina",
    },
    {
      slug: "hooded-eyes-lift",
      representationGroup: "mixed",
    },
    {
      slug: "korean-dewy-glow",
      representationGroup: "diverse-unspecified",
    },
    {
      slug: "passport-photo-clean",
      representationGroup: "middle-eastern",
    },
    {
      slug: "rose-milk-date",
      representationGroup: "mixed",
    },
  ].map(
    ({ slug, representationGroup }): LookAssetVariant => ({
      id: `${slug}--global-diverse-v2`,
      marketVariantId: `${slug}--global-diverse`,
      image: `/images/looks/${slug}--global-diverse.webp`,
      representationGroup: representationGroup as RepresentationGroup,
      skinToneBand: "unspecified",
      theme: "neutral",
      aspectRatio: "1:1",
      focalPosition: "center",
      qualityStatus: "approved",
      promptVersion: "global-diverse-v2",
    }),
  );

  return [
    ...eastAsiaAssets,
    ...globalEnglishAssets,
    ...globalDiverseGeneratedAssets,
    ...defaultAssets,
  ];
}

function freshAssetPool(assets: LookAssetVariant[]): LookAssetVariant[] {
  const freshAssets = assets.filter(
    (asset) => asset.promptVersion !== "legacy-1.0",
  );
  return freshAssets.length > 0 ? freshAssets : assets;
}

/** 按 assetId 查找 */
export function getAssetById(id: string): LookAssetVariant | undefined {
  return assets.find((a) => a.id === id);
}

/** 按 marketVariantId 查找所有资产 */
export function getAssetsForVariant(
  marketVariantId: string,
): LookAssetVariant[] {
  return assets.filter((a) => a.marketVariantId === marketVariantId);
}

/**
 * 按 marketVariantId 和偏好选择最佳资产。
 * 如果目标变体没有专属资产，回退到同一 recipe 的 global-diverse 变体资产。
 */
export function selectBestAsset(
  marketVariantId: string,
  representationPreference: string[] = ["diverse"],
): LookAssetVariant | undefined {
  // 先查目标变体的资产
  const variantAssets = getAssetsForVariant(marketVariantId).filter(
    (asset) => asset.qualityStatus === "approved",
  );
  if (variantAssets.length > 0) {
    const candidateAssets = freshAssetPool(variantAssets);
    const explicitPreference = representationPreference.find(
      (preference) => preference !== "diverse",
    );
    const preferred = explicitPreference
      ? candidateAssets.find(
          (asset) => asset.representationGroup === explicitPreference,
        )
      : undefined;
    return (
      preferred ??
      candidateAssets[stableIndex(marketVariantId, candidateAssets.length)]
    );
  }

  // 回退：从 variantId 中提取 recipeId，查 global-diverse 变体
  const recipeId = marketVariantId.split("--")[0];
  if (recipeId) {
    const fallbackAssets = freshAssetPool(
      getAssetsForVariant(`${recipeId}--global-diverse`),
    );
    if (fallbackAssets.length > 0) {
      return fallbackAssets[0];
    }
  }

  return undefined;
}

function stableIndex(value: string, length: number): number {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % length;
}
