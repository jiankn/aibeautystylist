import { describe, expect, it } from "vitest";
import { languageConfigs } from "./config";
import {
  getLanguageSwitchPathname,
  getLocalizedAppHref,
  resolveLocaleRoute,
  shouldRewriteLocaleRoute,
} from "./routing";
import {
  getLocalizedSeoPagesByLanguage,
  getLocalizedSeoGroupForRoute,
  hasLocalizedSeoPageForRoute,
} from "./localizedSeoPages";

describe("localized route switching", () => {
  it("localizes the canonical try-on workspace route", () => {
    expect(getLocalizedAppHref("/tryon?look=commute", "zh-cn")).toBe(
      "/zh-cn/tryon?look=commute",
    );
    expect(shouldRewriteLocaleRoute("/zh-cn/tryon")).toBe(true);
    expect(resolveLocaleRoute("/zh-cn/tryon").routePathname).toBe("/tryon");
  });

  it("maps the Korean makeup order guide to the Simplified Chinese article", () => {
    const href = getLanguageSwitchPathname("/ko/guides/메이크업-순서", "zh-cn");
    const route = resolveLocaleRoute(href);

    expect(href).toBe("/zh-cn/guides/化妆顺序");
    expect(hasLocalizedSeoPageForRoute("zh-cn", route.routePathname)).toBe(
      true,
    );
  });

  it("falls back to the English canonical page when a translation is missing", () => {
    expect(getLanguageSwitchPathname("/ko/guides/메이크업-순서", "de")).toBe(
      "/guides/beginner-routine",
    );
  });

  it("does not produce missing localized SEO routes for language switch links", () => {
    const sourcePaths = new Set<string>();

    for (const sourceLanguage of languageConfigs.filter(
      (language) => language.slug !== "en",
    )) {
      for (const page of getLocalizedSeoPagesByLanguage(sourceLanguage.slug)) {
        sourcePaths.add(`/${sourceLanguage.pathPrefix}${page.path}`);

        const group = getLocalizedSeoGroupForRoute(
          page.languageSlug,
          page.path,
        );
        if (group) sourcePaths.add(group.englishPath);
      }
    }

    for (const sourcePath of sourcePaths) {
      for (const targetLanguage of languageConfigs) {
        const href = getLanguageSwitchPathname(sourcePath, targetLanguage.slug);
        const route = resolveLocaleRoute(href);

        if (route.hasLocalePrefix) {
          expect(
            hasLocalizedSeoPageForRoute(
              route.language.slug,
              route.routePathname,
            ),
            `${sourcePath} -> ${targetLanguage.slug} generated missing route ${href}`,
          ).toBe(true);
        }
      }
    }
  });
});
