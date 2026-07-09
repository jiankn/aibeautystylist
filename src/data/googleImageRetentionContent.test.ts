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
});
