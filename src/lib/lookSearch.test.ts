import { beforeAll, describe, expect, it } from "vitest";

type SearchDocument = {
  locale: string;
  title: string;
  text: string;
  compactText: string;
  tokens: string[];
};

type LookSearchApi = {
  createDocument(input: {
    title?: string;
    text?: string;
    aliases?: string[];
    locale?: string;
  }): SearchDocument;
  detectAlternativeLocale(query: string, locale: string): string | null;
  normalize(value: string, locale: string): string;
  score(
    document: SearchDocument,
    query: string,
    locale?: string,
  ): number | null;
};

let search: LookSearchApi;

beforeAll(async () => {
  // @ts-expect-error Classic browser script intentionally exposes a global API.
  await import("../../public/look-search.js");
  search = (globalThis as typeof globalThis & { AbsLookSearch: LookSearchApi })
    .AbsLookSearch;
});

describe("localized look search", () => {
  it("normalizes case, width, and Latin accents", () => {
    expect(search.normalize("  ＢÉAUTÉ  ", "fr-FR")).toBe("beaute");
  });

  it("matches same-language typos without making short queries fuzzy", () => {
    const document = search.createDocument({
      title: "Natural Beginner",
      text: "Natural clean makeup for daily wear",
      locale: "en",
    });

    expect(search.score(document, "natual", "en")).not.toBeNull();
    expect(search.score(document, "nt", "en")).toBeNull();
  });

  it("keeps arbitrary English queries out of a Chinese index", () => {
    const document = search.createDocument({
      title: "通勤清透妆",
      text: "适合日常上班的自然轻薄妆容",
      locale: "zh-CN",
    });

    expect(search.score(document, "commute", "zh-CN")).toBeNull();
    expect(search.score(document, "通勤清秀妆", "zh-CN")).not.toBeNull();
  });

  it("supports curated local beauty vocabulary", () => {
    const document = search.createDocument({
      title: "柔雾烟熏妆",
      text: "适合晚间活动",
      locale: "zh-CN",
    });

    expect(search.score(document, "smoky", "zh-CN")).not.toBeNull();
  });

  it("suggests a supported language only for clear script mismatches", () => {
    expect(search.detectAlternativeLocale("natural makeup", "zh-CN")).toBe(
      "en",
    );
    expect(search.detectAlternativeLocale("通勤妆", "en")).toBe("zh-CN");
    expect(search.detectAlternativeLocale("ナチュラル", "en")).toBe("ja-JP");
    expect(search.detectAlternativeLocale("maquillage", "en")).toBeNull();
    expect(search.detectAlternativeLocale("maquillaje", "zh-CN")).toBeNull();
  });
});
