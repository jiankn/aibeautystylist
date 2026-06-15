import { describe, expect, it } from "vitest";

import { normalizeRepresentationPreferences } from "../../lib/contentPreferences";
import { assets, selectBestAsset } from "./assets";
import {
  getDefaultMarketProfile,
  getMarketProfileOptions,
} from "./audienceProfiles";
import type { AudienceContext } from "./audienceTypes";
import { allRecipeIds, pilotRecipeIds } from "./marketVariants";
import { resolveAudienceContext } from "./resolveAudienceContext";
import { resolveBySnapshot, resolveLookCatalog } from "./resolveCatalog";
import { resolvePageAssets } from "./resolvePageAssets";

const publicAssetPaths = new Set(
  Object.keys(import.meta.glob("../../../public/**/*")).map((path) =>
    path.replace("../../../public", ""),
  ),
);

const eastAsiaContext: AudienceContext = {
  locale: "zh-CN",
  marketProfile: "east-asia",
  beautyPreferences: [],
  representationPreference: ["diverse"],
  source: "locale",
};

const globalContext: AudienceContext = {
  locale: "en",
  marketProfile: "global-english",
  beautyPreferences: [],
  representationPreference: ["diverse"],
  source: "locale",
};

describe("global makeup localization architecture", () => {
  it("maps regional locales and safely falls back for unknown locales", () => {
    expect(getDefaultMarketProfile("zh-CN")).toBe("east-asia");
    expect(getDefaultMarketProfile("ja-JP")).toBe("east-asia");
    expect(getDefaultMarketProfile("pt-BR")).toBe("latin-america");
    expect(getDefaultMarketProfile("de-DE")).toBe("western-europe");
    expect(getDefaultMarketProfile("xx-ZZ")).toBe("global-diverse");
    expect(
      getMarketProfileOptions("ja-JP").map((option) => option.value),
    ).toEqual(["east-asia"]);
  });

  it("resolves account preferences before cookies for non-east-asia locales", () => {
    const cookies = {
      get: (name: string) =>
        name === "abs_market_profile" ? { value: "western-europe" } : undefined,
    };

    expect(
      resolveAudienceContext("de-DE", cookies, {
        marketProfile: "latin-america",
        representationPreferences: ["latina"],
      }),
    ).toMatchObject({
      marketProfile: "latin-america",
      representationPreference: ["latina"],
      source: "account",
    });
  });

  it("locks east-asia languages to east-asia assets over stored preferences", () => {
    const cookies = {
      get: (name: string) =>
        name === "abs_market_profile" ? { value: "western-europe" } : undefined,
    };

    for (const locale of ["zh-CN", "zh-TW", "ja-JP", "ko-KR"]) {
      const audienceContext = resolveAudienceContext(locale, cookies, {
        marketProfile: "latin-america",
        representationPreferences: ["latina"],
      });
      expect(audienceContext).toMatchObject({
        locale,
        marketProfile: "east-asia",
        representationPreference: ["east-asian"],
        source: "locale",
      });
      expect(
        resolveLookCatalog(audienceContext).every(
          (look) =>
            look.marketVariantId.endsWith("--east-asia") &&
            look.image.endsWith("--east-asia.webp"),
        ),
      ).toBe(true);
    }
  });

  it("defensively locks conflicting east-asia contexts and old snapshots", () => {
    const conflictingContext: AudienceContext = {
      locale: "ja-JP",
      marketProfile: "global-diverse",
      beautyPreferences: [],
      representationPreference: ["black"],
      source: "account",
    };

    expect(
      resolveLookCatalog(conflictingContext).every((look) =>
        look.marketVariantId.endsWith("--east-asia"),
      ),
    ).toBe(true);
    expect(
      resolvePageAssets("login", conflictingContext).heroImages?.light,
    ).toBe("/images/login-hero-east-asia-light.webp");
    expect(
      resolveBySnapshot(
        {
          lookSlug: "commute",
          lookRecipeId: "commute",
          marketVariantId: "commute--global-english",
          referenceAssetId: "commute--africa",
          locale: "ja-JP",
        },
        conflictingContext,
      ),
    ).toMatchObject({
      marketVariantId: "commute--east-asia",
      image: "/images/looks/commute--east-asia.webp",
    });
  });

  it("normalizes invalid or conflicting representation preferences", () => {
    expect(normalizeRepresentationPreferences(["black", "black"])).toEqual([
      "black",
    ]);
    expect(normalizeRepresentationPreferences(["black", "diverse"])).toEqual([
      "diverse",
    ]);
    expect(normalizeRepresentationPreferences(["invalid"])).toEqual([
      "diverse",
    ]);
  });

  it("serves the full catalog and east-asia assets for every look", () => {
    const eastLooks = resolveLookCatalog(eastAsiaContext);
    const globalLooks = resolveLookCatalog(globalContext);

    expect(eastLooks).toHaveLength(44);
    expect(globalLooks).toHaveLength(44);

    for (const recipeId of allRecipeIds) {
      expect(eastLooks.find((look) => look.slug === recipeId)).toMatchObject({
        marketVariantId: `${recipeId}--east-asia`,
        image: `/images/looks/${recipeId}--east-asia.webp`,
      });
    }

    for (const recipeId of pilotRecipeIds) {
      expect(globalLooks.find((look) => look.slug === recipeId)?.image).toMatch(
        new RegExp(`/images/looks/${recipeId}--(africa|south-asia).webp`),
      );
    }
  });

  it("honors explicit representation preferences", () => {
    expect(selectBestAsset("commute--global-english", ["black"])?.image).toBe(
      "/images/looks/commute--africa.webp",
    );
    expect(
      selectBestAsset("commute--global-english", ["south-asian"])?.image,
    ).toBe("/images/looks/commute--south-asia.webp");
    expect(selectBestAsset("date--global-diverse")?.image).toBe(
      "/images/looks/date--global-diverse.webp",
    );
  });

  it("keeps approved asset metadata and files aligned", () => {
    for (const asset of assets.filter(
      (candidate) => candidate.qualityStatus === "approved",
    )) {
      expect(publicAssetPaths.has(asset.image)).toBe(true);
      if (asset.image.includes("/images/looks/")) {
        expect(asset.aspectRatio).toBe("1:1");
      }
    }
  });

  it("restores the original variant and asset from a job snapshot", () => {
    const original = resolveLookCatalog({
      ...globalContext,
      representationPreference: ["black"],
    }).find((look) => look.slug === "commute")!;

    const restored = resolveBySnapshot(
      {
        lookSlug: original.slug,
        lookRecipeId: original.recipeId,
        lookRecipeVersion: original.recipeVersion,
        marketVariantId: original.marketVariantId,
        referenceAssetId: original.assetId,
        locale: "en",
        marketProfile: "global-english",
      },
      eastAsiaContext,
    );

    expect(restored).toMatchObject({
      recipeId: original.recipeId,
      marketVariantId: original.marketVariantId,
      assetId: original.assetId,
      image: original.image,
    });
  });

  it("resolves page imagery from audience context without missing files", () => {
    const eastHome = resolvePageAssets("home", eastAsiaContext);
    const globalHome = resolvePageAssets("home", globalContext);
    const eastLogin = resolvePageAssets("login", eastAsiaContext);
    const globalLogin = resolvePageAssets("login", globalContext);

    expect(eastHome.scenarioImages?.commute).not.toBe(
      globalHome.scenarioImages?.commute,
    );
    expect(globalHome.heroImages?.light).toBe(
      "/images/home-hero-global-commute-after.webp",
    );
    expect(globalHome.heroImagesBefore?.light).toBe(
      "/images/home-hero-global-commute-before.webp",
    );
    expect(eastHome.heroImages?.light).not.toBe(globalHome.heroImages?.light);
    expect(eastLogin.heroImages?.light).not.toBe(globalLogin.heroImages?.light);
    for (const path of [
      eastHome.heroImages?.light,
      eastHome.heroImagesBefore?.light,
      globalHome.heroImages?.light,
      globalHome.heroImagesBefore?.light,
      ...Object.values(eastHome.scenarioImages ?? {}),
      ...Object.values(globalHome.scenarioImages ?? {}),
      eastLogin.heroImages?.light,
      globalLogin.heroImages?.light,
      resolvePageAssets("diagnosis", eastAsiaContext).exampleImages?.[0],
      resolvePageAssets("diagnosis", globalContext).exampleImages?.[0],
    ]) {
      expect(path).toBeTruthy();
      expect(publicAssetPaths.has(path!)).toBe(true);
    }
  });
});
