export const appLocaleCodes = [
  "en",
  "zh-CN",
  "de-DE",
  "fr-FR",
  "ja-JP",
  "ko-KR",
  "zh-TW",
  "es-ES",
  "es-419",
  "pt-BR",
] as const;

export type AppLocale = (typeof appLocaleCodes)[number];
export type TextDirection = "ltr" | "rtl";

export interface LanguageConfig {
  readonly slug: string;
  readonly pathPrefix: string;
  readonly locale: AppLocale;
  readonly hreflang: string;
  readonly label: string;
  readonly nativeLabel: string;
  readonly direction: TextDirection;
  readonly includeInLanguageSwitcher: boolean;
  readonly includeInSitemap: boolean;
}

export const languageConfigs = [
  {
    slug: "en",
    pathPrefix: "",
    locale: "en",
    hreflang: "en",
    label: "English",
    nativeLabel: "English",
    direction: "ltr",
    includeInLanguageSwitcher: true,
    includeInSitemap: true,
  },
  {
    slug: "zh-cn",
    pathPrefix: "zh-cn",
    locale: "zh-CN",
    hreflang: "zh-Hans",
    label: "Simplified Chinese",
    nativeLabel: "简体中文",
    direction: "ltr",
    includeInLanguageSwitcher: true,
    includeInSitemap: true,
  },
  {
    slug: "de",
    pathPrefix: "de",
    locale: "de-DE",
    hreflang: "de",
    label: "German",
    nativeLabel: "Deutsch",
    direction: "ltr",
    includeInLanguageSwitcher: true,
    includeInSitemap: true,
  },
  {
    slug: "fr",
    pathPrefix: "fr",
    locale: "fr-FR",
    hreflang: "fr",
    label: "French",
    nativeLabel: "Français",
    direction: "ltr",
    includeInLanguageSwitcher: true,
    includeInSitemap: true,
  },
  {
    slug: "ja",
    pathPrefix: "ja",
    locale: "ja-JP",
    hreflang: "ja",
    label: "Japanese",
    nativeLabel: "日本語",
    direction: "ltr",
    includeInLanguageSwitcher: true,
    includeInSitemap: true,
  },
  {
    slug: "ko",
    pathPrefix: "ko",
    locale: "ko-KR",
    hreflang: "ko",
    label: "Korean",
    nativeLabel: "한국어",
    direction: "ltr",
    includeInLanguageSwitcher: true,
    includeInSitemap: true,
  },
  {
    slug: "zh-tw",
    pathPrefix: "zh-tw",
    locale: "zh-TW",
    hreflang: "zh-Hant",
    label: "Traditional Chinese",
    nativeLabel: "繁體中文",
    direction: "ltr",
    includeInLanguageSwitcher: true,
    includeInSitemap: true,
  },
  {
    slug: "es",
    pathPrefix: "es",
    locale: "es-ES",
    hreflang: "es",
    label: "Spanish",
    nativeLabel: "Español",
    direction: "ltr",
    includeInLanguageSwitcher: true,
    includeInSitemap: true,
  },
  {
    slug: "pt-br",
    pathPrefix: "pt-br",
    locale: "pt-BR",
    hreflang: "pt-BR",
    label: "Brazilian Portuguese",
    nativeLabel: "Português (BR)",
    direction: "ltr",
    includeInLanguageSwitcher: true,
    includeInSitemap: true,
  },
] as const satisfies readonly LanguageConfig[];

export type LanguageSlug = (typeof languageConfigs)[number]["slug"];

export const defaultLanguage = languageConfigs[0];

const localeSet = new Set<string>(appLocaleCodes);
const languagesBySlug = new Map<string, LanguageConfig>(
  languageConfigs.map((language) => [language.slug, language]),
);
const languagesByPrefix = new Map<string, LanguageConfig>(
  languageConfigs
    .filter((language) => language.pathPrefix)
    .map((language) => [language.pathPrefix, language]),
);
const languagesByLocale = new Map<string, LanguageConfig>(
  languageConfigs.map((language) => [language.locale.toLowerCase(), language]),
);

export function isAppLocale(value: string): value is AppLocale {
  return localeSet.has(value);
}

export function getLanguageBySlug(
  slug: string | null | undefined,
): LanguageConfig | undefined {
  if (!slug) return undefined;
  return languagesBySlug.get(slug.toLowerCase());
}

export function getLanguageByPathPrefix(
  prefix: string | null | undefined,
): LanguageConfig | undefined {
  if (!prefix) return undefined;
  return languagesByPrefix.get(prefix.toLowerCase());
}

export function getLanguageByLocale(
  locale: string | null | undefined,
): LanguageConfig | undefined {
  if (!locale) return undefined;
  const lower = locale.toLowerCase();
  return (
    languagesByLocale.get(lower) ??
    languageConfigs.find((language) =>
      lower.startsWith(language.locale.toLowerCase().split("-")[0] ?? ""),
    )
  );
}
