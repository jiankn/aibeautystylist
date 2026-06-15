import { AsyncLocalStorage } from "node:async_hooks";
import zhCN from "../locales/zh-CN.json";
import en from "../locales/en.json";
import de from "../locales/de.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";
import ja from "../locales/ja.json";
import ko from "../locales/ko.json";
import ptBR from "../locales/pt-BR.json";
import zhTW from "../locales/zh-TW.json";
import { appLocaleCodes, type AppLocale } from "../i18n/config";

type LocaleDictionary = typeof zhCN;
type PartialLocaleDictionary = {
  [Section in keyof LocaleDictionary]?: Partial<LocaleDictionary[Section]>;
};
type TranslationSection = keyof LocaleDictionary;

/**
 * 运行时支持的 locale。
 * zh-CN 和 en 有完整字典，其余语言按部分字典逐步接入，缺失项回退到 en。
 */
export type SupportedLocale = AppLocale;

export const defaultLocale: SupportedLocale = "en";
export const supportedLocales: SupportedLocale[] = [...appLocaleCodes];
export const localeStorage = new AsyncLocalStorage<SupportedLocale>();

/**
 * 将输入的语言标签规范化为 SupportedLocale。
 *
 * 支持 BCP 47 完整 locale（如 pt-BR、es-419、de-DE），
 * 无法识别时回退到 defaultLocale。
 */
export function normalizeLocale(locale?: string | null): SupportedLocale {
  if (!locale) return defaultLocale;
  const value = locale.split(",")[0]?.split(";")[0]?.trim() ?? "";

  // 精确匹配（大小写不敏感）
  const lower = value.toLowerCase();
  if (lower === "zh-cn" || lower === "zh_cn") return "zh-CN";
  if (
    lower === "zh-tw" ||
    lower === "zh_tw" ||
    lower === "zh-hant" ||
    lower === "zh_hant"
  )
    return "zh-TW";
  if (lower === "pt-br" || lower === "pt_br") return "pt-BR";
  if (lower === "es-419") return "es-419";
  if (lower === "es-es" || lower === "es_es") return "es-ES";
  if (lower === "de-de" || lower === "de_de") return "de-DE";
  if (lower === "fr-fr" || lower === "fr_fr") return "fr-FR";
  if (lower === "ja-jp" || lower === "ja_jp") return "ja-JP";
  if (lower === "ko-kr" || lower === "ko_kr") return "ko-KR";
  if (lower === "en-us" || lower === "en-gb" || lower === "en-ca") return "en";
  if (lower === "en" || lower.startsWith("en-") || lower.startsWith("en_"))
    return "en";

  // 语言前缀匹配
  if (lower.startsWith("zh-tw") || lower.startsWith("zh-hant")) return "zh-TW";
  if (lower.startsWith("zh")) return "zh-CN";
  if (lower.startsWith("pt")) return "pt-BR";
  if (lower.startsWith("es-419")) return "es-419";
  if (lower.startsWith("es")) return "es-ES";
  if (lower.startsWith("de")) return "de-DE";
  if (lower.startsWith("fr")) return "fr-FR";
  if (lower.startsWith("ja")) return "ja-JP";
  if (lower.startsWith("ko")) return "ko-KR";

  return defaultLocale;
}

const dictionaries: Record<string, PartialLocaleDictionary> = {
  en: en as LocaleDictionary,
  "zh-CN": zhCN,
  "de-DE": de,
  "fr-FR": fr,
  "ja-JP": ja,
  "ko-KR": ko,
  "zh-TW": zhTW,
  "es-ES": es,
  "es-419": es,
  "pt-BR": ptBR,
};

/**
 * 提取 locale 的主语言码。
 * "zh-CN" → "zh", "pt-BR" → "pt", "en" → "en"
 */
export function localeToLanguage(locale: string): string {
  return locale.split("-")[0]?.toLowerCase() ?? locale.toLowerCase();
}

export function getCurrentLocale(): SupportedLocale {
  return localeStorage.getStore() || defaultLocale;
}

export function t<
  Section extends TranslationSection,
  Key extends keyof LocaleDictionary[Section],
>(section: Section, key: Key): LocaleDictionary[Section][Key] {
  const locale = getCurrentLocale();
  const dict = dictionaries[locale] ?? dictionaries.en;
  return (dict[section]?.[key] ??
    (en as LocaleDictionary)[section]?.[key] ??
    zhCN[section]?.[key]) as LocaleDictionary[Section][Key];
}
