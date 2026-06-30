import { blogSlugs } from "../data/blogData";
import { languageConfigs, type LanguageSlug } from "./config";
import { buildHreflangLinks } from "./hreflang";
import { getLocalizedSeoPagesByLanguage } from "./localizedSeoPages";
import { addLocalePrefix } from "./routing";

export interface SitemapPage {
  readonly url: string;
  readonly priority: string;
  readonly changefreq: string;
}

export const sitemapLastmod = "2026-06-30";

const corePages: SitemapPage[] = [
  { url: "/", priority: "1.0", changefreq: "weekly" },
  { url: "/discover", priority: "0.9", changefreq: "weekly" },
  { url: "/tryon", priority: "0.9", changefreq: "monthly" },
  { url: "/diagnosis", priority: "0.8", changefreq: "monthly" },
  { url: "/pricing", priority: "0.8", changefreq: "weekly" },
  { url: "/blog", priority: "0.7", changefreq: "weekly" },
  { url: "/faq", priority: "0.6", changefreq: "monthly" },
  { url: "/support", priority: "0.5", changefreq: "monthly" },
  { url: "/about", priority: "0.5", changefreq: "monthly" },
  { url: "/privacy", priority: "0.3", changefreq: "yearly" },
  { url: "/terms", priority: "0.3", changefreq: "yearly" },
  { url: "/ai-disclaimer", priority: "0.3", changefreq: "yearly" },
];

const productPages: SitemapPage[] = [
  { url: "/virtual-makeup-app", priority: "0.8", changefreq: "weekly" },
  { url: "/ai-makeup-try-on", priority: "0.8", changefreq: "weekly" },
  { url: "/ai-makeup-generator", priority: "0.8", changefreq: "weekly" },
  { url: "/makeup-photo-editor", priority: "0.7", changefreq: "monthly" },
  { url: "/ai-beauty-advisor", priority: "0.7", changefreq: "monthly" },
  { url: "/virtual-makeup-tester", priority: "0.7", changefreq: "monthly" },
  {
    url: "/personalized-makeup-recommendation",
    priority: "0.7",
    changefreq: "monthly",
  },
];

const lookPages: SitemapPage[] = [
  { url: "/looks/soft-glam", priority: "0.7", changefreq: "monthly" },
  { url: "/looks/natural-makeup", priority: "0.7", changefreq: "monthly" },
  { url: "/looks/no-makeup-makeup", priority: "0.7", changefreq: "monthly" },
  { url: "/looks/dewy-skin", priority: "0.7", changefreq: "monthly" },
  { url: "/looks/matte-makeup", priority: "0.7", changefreq: "monthly" },
  { url: "/looks/date-night", priority: "0.7", changefreq: "monthly" },
  { url: "/looks/minimalist", priority: "0.7", changefreq: "monthly" },
  { url: "/looks/glass-skin", priority: "0.7", changefreq: "monthly" },
  { url: "/looks/clean-girl", priority: "0.7", changefreq: "monthly" },
  { url: "/looks/glowy", priority: "0.7", changefreq: "monthly" },
];

const scenarioPages: SitemapPage[] = [
  { url: "/scenarios/interview", priority: "0.7", changefreq: "monthly" },
  { url: "/scenarios/office", priority: "0.7", changefreq: "monthly" },
  { url: "/scenarios/first-date", priority: "0.7", changefreq: "monthly" },
  { url: "/scenarios/passport-photo", priority: "0.6", changefreq: "monthly" },
  { url: "/scenarios/wedding-guest", priority: "0.6", changefreq: "monthly" },
  { url: "/scenarios/prom", priority: "0.6", changefreq: "yearly" },
  { url: "/scenarios/graduation", priority: "0.6", changefreq: "yearly" },
  { url: "/scenarios/vacation", priority: "0.6", changefreq: "monthly" },
  { url: "/scenarios/quick-5min", priority: "0.6", changefreq: "monthly" },
  { url: "/scenarios/nighttime", priority: "0.6", changefreq: "monthly" },
];

const demographicPages: SitemapPage[] = [
  { url: "/for/hooded-eyes", priority: "0.7", changefreq: "monthly" },
  { url: "/for/round-face", priority: "0.6", changefreq: "monthly" },
  { url: "/for/mature-skin", priority: "0.6", changefreq: "monthly" },
  { url: "/for/dark-skin", priority: "0.6", changefreq: "monthly" },
  { url: "/for/olive-skin", priority: "0.6", changefreq: "monthly" },
  { url: "/for/fair-skin", priority: "0.6", changefreq: "monthly" },
  { url: "/for/single-eyelids", priority: "0.6", changefreq: "monthly" },
  { url: "/for/face-shape-contour", priority: "0.7", changefreq: "monthly" },
];

const guidePages: SitemapPage[] = [
  { url: "/guides/beginner-tutorial", priority: "0.7", changefreq: "monthly" },
  { url: "/guides/apply-step-by-step", priority: "0.6", changefreq: "monthly" },
  { url: "/guides/beginner-routine", priority: "0.6", changefreq: "monthly" },
  { url: "/guides/easy-everyday", priority: "0.6", changefreq: "monthly" },
  { url: "/guides/natural-makeup-how", priority: "0.6", changefreq: "monthly" },
  { url: "/guides/makeup-essentials", priority: "0.6", changefreq: "monthly" },
  { url: "/guides/mistakes-avoid", priority: "0.6", changefreq: "monthly" },
  {
    url: "/guides/drugstore-beginners",
    priority: "0.6",
    changefreq: "monthly",
  },
];

const englishPages: SitemapPage[] = [
  ...corePages,
  ...productPages,
  ...lookPages,
  ...scenarioPages,
  ...demographicPages,
  ...guidePages,
  ...blogSlugs.map((slug) => ({
    url: `/blog/${slug}`,
    priority: "0.6",
    changefreq: "monthly",
  })),
];

const localizedBlogPages: SitemapPage[] = [
  { url: "/blog", priority: "0.7", changefreq: "weekly" },
  ...blogSlugs.map((slug) => ({
    url: `/blog/${slug}`,
    priority: "0.6",
    changefreq: "monthly",
  })),
];

function buildLocalizedSeoPages(languageSlug: LanguageSlug): SitemapPage[] {
  const pages = [
    ...localizedBlogPages.map((page) => ({
      ...page,
      url: addLocalePrefix(page.url, languageSlug),
    })),
    ...getLocalizedSeoPagesByLanguage(languageSlug).map((page) => ({
      url: addLocalePrefix(page.path, page.languageSlug),
      priority: page.priority,
      changefreq: page.changefreq,
    })),
  ];

  return [...new Map(pages.map((page) => [page.url, page])).values()];
}

const pagesByLanguage: Partial<Record<LanguageSlug, SitemapPage[]>> = {
  en: englishPages,
  "zh-cn": buildLocalizedSeoPages("zh-cn"),
  de: buildLocalizedSeoPages("de"),
  fr: buildLocalizedSeoPages("fr"),
  ja: buildLocalizedSeoPages("ja"),
  ko: buildLocalizedSeoPages("ko"),
  "zh-tw": buildLocalizedSeoPages("zh-tw"),
  es: buildLocalizedSeoPages("es"),
  "pt-br": buildLocalizedSeoPages("pt-br"),
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function getSitemapLanguages() {
  return languageConfigs.filter(
    (language) =>
      language.includeInSitemap &&
      (pagesByLanguage[language.slug]?.length ?? 0) > 0,
  );
}

export function getSitemapPages(languageSlug: LanguageSlug | string) {
  return pagesByLanguage[languageSlug as LanguageSlug] ?? [];
}

export function renderSitemapIndex(site: string): string {
  const languages = getSitemapLanguages();
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${languages
  .map(
    (language) => `  <sitemap>
    <loc>${escapeXml(new URL(`/sitemap-${language.slug}.xml`, site).href)}</loc>
    <lastmod>${sitemapLastmod}</lastmod>
  </sitemap>`,
  )
  .join("\n")}
</sitemapindex>`;
}

export function renderUrlset(
  site: string,
  pages: readonly SitemapPage[],
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages
  .map((page) => {
    const alternates = buildHreflangLinks(page.url, site)
      .map(
        (link) =>
          `    <xhtml:link rel="alternate" hreflang="${escapeXml(link.hreflang)}" href="${escapeXml(link.href)}" />`,
      )
      .join("\n");

    return `  <url>
    <loc>${escapeXml(new URL(page.url, site).href)}</loc>
${alternates}
    <lastmod>${sitemapLastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;
}
