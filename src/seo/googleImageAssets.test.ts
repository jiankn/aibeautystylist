import { describe, expect, it } from "vitest";

import {
  googleImageAssets,
  renderGoogleImageSitemap,
} from "./googleImageAssets";
import { renderSitemapIndex } from "../i18n/sitemap";

const SITE = "https://aibeautystylist.com";

const requiredLaunchPins = [
  "ai_makeup_tryon_01",
  "pin_5min_01",
  "pin_soft_glam_01",
  "pin_wedding_guest_01",
  "pin_5min_real_morning_02",
  "pin_office_real_workday_01",
  "pin_date_night_candlelight_01",
  "pin_hooded_visible_shadow_01",
  "pin_passport_no_flashback_01",
  "pin_glass_skin_not_greasy_01",
  "pin_first_date_soft_daylight_01",
  "pin_summer_wedding_heatproof_01",
  "pin_smudged_smoky_night_01",
  "pin_mature_skin_no_caking_01",
  "pin_no_makeup_real_daylight_01",
  "pin_olive_skin_muted_rose_01",
  "pin_blush_placement_map_01",
  "pin_jelly_lip_real_daylight_01",
  "pin_burgundy_velvet_editorial_01",
  "pin_champagne_eye_glow_editorial_01",
  "pin_sunset_bronze_editorial_01",
  "pin_cloud_skin_editorial_01",
  "pin_french_natural_editorial_01",
  "pin_soft_berry_stain_editorial_01",
] as const;

const publicImageModules = import.meta.glob("../../public/images/**/*", {
  eager: true,
  import: "default",
  query: "?url",
});
const publicImagePaths = new Set(
  Object.keys(publicImageModules).map((filePath) =>
    filePath.replace("../../public", ""),
  ),
);

describe("googleImageAssets", () => {
  it("covers the first 24 Pinterest and Google Images topics", () => {
    const sourcePins = new Set(
      googleImageAssets.map((asset) => asset.sourcePin),
    );

    for (const pin of requiredLaunchPins) {
      expect(sourcePins.has(pin), pin).toBe(true);
    }
  });

  it("points every image sitemap entry to a real public image file", () => {
    for (const asset of googleImageAssets) {
      expect(asset.imageUrl.startsWith("/images/"), asset.imageUrl).toBe(true);
      expect(publicImagePaths.has(asset.imageUrl), asset.imageUrl).toBe(true);
    }
  });

  it("keeps page and image pairs unique", () => {
    const pairs = googleImageAssets.map(
      (asset) => `${asset.pageUrl}::${asset.imageUrl}`,
    );

    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it("renders an image sitemap with absolute page and image URLs", () => {
    const sitemap = renderGoogleImageSitemap(SITE);

    expect(sitemap).toContain(
      'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
    );
    expect(sitemap.match(/<image:image>/g)?.length).toBe(
      googleImageAssets.length,
    );

    for (const asset of googleImageAssets) {
      expect(sitemap).toContain(new URL(asset.pageUrl, SITE).href);
      expect(sitemap).toContain(new URL(asset.imageUrl, SITE).href);
      expect(sitemap).toContain(asset.title);
    }
  });

  it("includes the image sitemap in the sitemap index", () => {
    expect(renderSitemapIndex(SITE)).toContain(
      "https://aibeautystylist.com/sitemap-images.xml",
    );
  });
});
