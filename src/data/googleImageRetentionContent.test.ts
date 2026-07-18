import { describe, expect, it } from "vitest";

import { languageConfigs } from "../i18n/config";
import { googleImageAssets } from "../seo/googleImageAssets";
import {
  getActiveGoogleImageRetentionLocales,
  getGoogleImageRetentionContent,
  getGoogleImageRetentionPricingPath,
  getGoogleImageRetentionTryOnPath,
  getMissingGoogleImageRetentionPaths,
} from "./googleImageRetentionContent";

describe("googleImageRetentionContent", () => {
  it("supports every active site language", () => {
    expect(getActiveGoogleImageRetentionLocales()).toEqual(
      languageConfigs.map((language) => language.locale),
    );
  });

  it("covers every Google Images asset landing page", () => {
    expect(getMissingGoogleImageRetentionPaths()).toEqual([]);
  });

  it("renders complete localized copy for every active language and asset page", () => {
    const pageUrls = new Set(googleImageAssets.map((asset) => asset.pageUrl));

    for (const pageUrl of pageUrls) {
      for (const language of languageConfigs) {
        const content = getGoogleImageRetentionContent(
          pageUrl,
          language.locale,
        );

        expect(content, `${language.locale} ${pageUrl}`).toBeDefined();
        expect(content?.title).not.toContain("{topic}");
        expect(content?.body).not.toContain("{topic}");
        expect(content?.decisionBody).not.toContain("{topic}");
        expect(content?.copy.primaryLabel.length).toBeGreaterThan(4);
        expect(content?.copy.proofPoints.length).toBe(3);
      }
    }
  });

  it("builds no-sign-up try-on and membership paths", () => {
    const content = getGoogleImageRetentionContent("/scenarios/office", "en");

    expect(content).toBeDefined();
    expect(getGoogleImageRetentionTryOnPath(content!.topic)).toContain(
      "guest_try=1",
    );
    expect(getGoogleImageRetentionTryOnPath(content!.topic)).toContain(
      "source=google_images_office",
    );
    expect(getGoogleImageRetentionTryOnPath(content!.topic)).toContain(
      "#tryon-upload",
    );
    expect(getGoogleImageRetentionPricingPath(content!.topic)).toBe(
      "/pricing?source=google_images_office",
    );
  });

  it("keeps new campaign visuals aligned with locale asset packs", () => {
    const globalContent = getGoogleImageRetentionContent(
      "/for/mature-skin",
      "en",
    );
    const eastAsiaContent = getGoogleImageRetentionContent(
      "/for/mature-skin",
      "zh-CN",
    );

    const globalPath = getGoogleImageRetentionTryOnPath(globalContent!.topic);
    const eastAsiaPath = getGoogleImageRetentionTryOnPath(
      eastAsiaContent!.topic,
    );

    expect(globalPath).toContain("pin_visual=mature_skin_no_caking");
    expect(globalPath).toContain("marketProfile=global-diverse");
    expect(eastAsiaPath).toContain("pin_visual=mature_skin_radiance_east_asia");
    expect(eastAsiaPath).toContain("marketProfile=east-asia");
  });

  it("keeps Pins 15 and 16 aligned with global and East Asian visuals", () => {
    const cases = [
      {
        page: "/looks/no-makeup-makeup",
        globalVisual: "no_makeup_real_daylight",
        eastAsiaVisual: "no_makeup_east_asia",
      },
      {
        page: "/for/olive-skin",
        globalVisual: "olive_skin_muted_rose",
        eastAsiaVisual: "olive_skin_muted_rose_east_asia",
      },
    ] as const;

    for (const item of cases) {
      const globalContent = getGoogleImageRetentionContent(item.page, "en");
      const eastAsiaContent = getGoogleImageRetentionContent(
        item.page,
        "zh-CN",
      );
      const globalPath = getGoogleImageRetentionTryOnPath(globalContent!.topic);
      const eastAsiaPath = getGoogleImageRetentionTryOnPath(
        eastAsiaContent!.topic,
      );

      expect(globalPath).toContain(`pin_visual=${item.globalVisual}`);
      expect(globalPath).toContain("marketProfile=global-diverse");
      expect(eastAsiaPath).toContain(`pin_visual=${item.eastAsiaVisual}`);
      expect(eastAsiaPath).toContain("marketProfile=east-asia");
    }
  });

  it("keeps Pins 17 and 18 aligned with global and East Asian visuals", () => {
    const cases = [
      {
        page: "/guides/blush-placement-map",
        globalVisual: "blush_placement_map",
        eastAsiaVisual: "watercolor_blush_east_asia",
      },
      {
        page: "/looks/jelly-lip-tint",
        globalVisual: "jelly_lip_real_daylight",
        eastAsiaVisual: "jelly_lip_east_asia",
      },
    ] as const;

    for (const item of cases) {
      const globalContent = getGoogleImageRetentionContent(item.page, "en");
      const eastAsiaContent = getGoogleImageRetentionContent(
        item.page,
        "zh-CN",
      );
      const globalPath = getGoogleImageRetentionTryOnPath(globalContent!.topic);
      const eastAsiaPath = getGoogleImageRetentionTryOnPath(
        eastAsiaContent!.topic,
      );

      expect(globalPath).toContain(`pin_visual=${item.globalVisual}`);
      expect(globalPath).toContain("marketProfile=global-diverse");
      expect(eastAsiaPath).toContain(`pin_visual=${item.eastAsiaVisual}`);
      expect(eastAsiaPath).toContain("marketProfile=east-asia");
    }
  });
});
