import { describe, expect, it } from "vitest";
import {
  footerSeoTargets,
  localizedFooterSeoPages,
} from "./localizedFooterSeoPages";

const eastAsianLanguages = new Set(["zh-cn", "zh-tw", "ja", "ko"]);

describe("localized footer SEO pages", () => {
  it("covers every footer target in every non-English language", () => {
    expect(footerSeoTargets).toHaveLength(14);
    expect(localizedFooterSeoPages).toHaveLength(14 * 8);

    for (const target of footerSeoTargets) {
      const pages = localizedFooterSeoPages.filter(
        (page) => page.englishPath === target.englishPath,
      );
      expect(pages).toHaveLength(8);
      expect(new Set(pages.map((page) => page.languageSlug)).size).toBe(8);
    }
  });

  it("uses one unique route per language and target", () => {
    const routeKeys = localizedFooterSeoPages.map(
      (page) => `${page.languageSlug}:${page.path}`,
    );
    expect(new Set(routeKeys).size).toBe(routeKeys.length);
  });

  it("places primary and secondary keywords in search-visible content", () => {
    for (const page of localizedFooterSeoPages) {
      expect(page.heroTitle).toBe(page.keyword);
      expect(page.title).toContain(page.keyword);
      expect(page.description).toContain(page.keyword);
      expect(page.description).toContain(page.topic);
      expect(
        page.sections.some(
          (section) =>
            section.title?.includes(page.keyword) ||
            section.paragraphs?.some((paragraph) =>
              paragraph.includes(page.keyword),
            ),
        ),
      ).toBe(true);
    }
  });

  it("uses the correct regional visual pack", () => {
    for (const page of localizedFooterSeoPages) {
      expect(page.heroImage).toBeTruthy();
      expect(page.ogImage).toBe(page.heroImage);
      if (eastAsianLanguages.has(page.languageSlug)) {
        expect(page.heroImage).toContain("--east-asia.webp");
      } else {
        expect(page.heroImage).not.toContain("--east-asia.webp");
      }
    }
  });

  it("ships topic-specific depth and at least three content assets", () => {
    for (const page of localizedFooterSeoPages) {
      expect(page.sections).toHaveLength(6);
      expect(page.sections.some((section) => section.kind === "grid")).toBe(
        true,
      );
      expect(
        page.sections.filter((section) => section.kind === "table"),
      ).toHaveLength(2);
      expect(page.faq.length).toBeGreaterThanOrEqual(4);
      expect(page.contentAssetsHeading).toBeTruthy();
      expect(page.contentAssets).toHaveLength(3);
      for (const asset of page.contentAssets ?? []) {
        expect(asset.src).toMatch(/^\/images\/.+\.(webp|png)$/);
        expect(asset.alt).toContain(page.keyword);
        expect(asset.caption.length).toBeGreaterThan(10);
      }
    }
  });

  it("does not reuse identical body content across sibling pages", () => {
    for (const languageSlug of [
      "zh-cn",
      "de",
      "fr",
      "ja",
      "ko",
      "zh-tw",
      "es",
      "pt-br",
    ]) {
      const pages = localizedFooterSeoPages.filter(
        (page) => page.languageSlug === languageSlug,
      );
      const bodies = pages.map((page) => JSON.stringify(page.sections));
      expect(new Set(bodies).size).toBe(pages.length);
    }
  });
});
