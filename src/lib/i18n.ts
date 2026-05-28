/**
 * i18n 架构预埋 — 翻译工具函数
 *
 * Phase 1: 仅英文，但文案从 JSON 语言包读取而非硬编码
 * Phase 2: 支持多语言包加载 + URL locale 前缀
 */

import en from '../locales/en.json';
import zhCN from '../locales/zh-CN.json';

export type Locale = 'en' | 'zh-CN';

const locales: Record<Locale, typeof en> = { en, 'zh-CN': zhCN };

const DEFAULT_LOCALE: Locale = 'en';
const LOCALE_PREFIXES: Record<string, Locale> = {
  zh: 'zh-CN',
};
const LOCALE_PATH_PREFIXES: Record<Locale, string> = {
  en: '',
  'zh-CN': '/zh',
};

/**
 * 获取翻译文本
 *
 * @param key - 点分路径，如 'hero.headline' 或 'nav.tryOn'
 * @param locale - 语言代码，默认 'en'
 * @returns 翻译文本，找不到则返回 key 本身
 *
 * @example
 * t('hero.headline') // "Find the look that's truly yours..."
 * t('nav.tryOn')     // "Try On"
 */
export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  const dict = locales[locale] ?? locales[DEFAULT_LOCALE];
  const parts = key.split('.');
  let current: unknown = dict;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key; // fallback: return key path if not found
    }
  }

  return typeof current === 'string' ? current : key;
}

/**
 * 获取当前 locale（从 URL 路径解析）
 * Phase 1: 总是返回 'en'
 * Phase 2: 从 /{locale}/ 前缀解析
 */
export function getLocaleFromUrl(_url: URL): Locale {
  const segment = _url.pathname.split('/').filter(Boolean)[0];
  return segment && segment in LOCALE_PREFIXES ? LOCALE_PREFIXES[segment] : DEFAULT_LOCALE;
}

/**
 * 生成带 locale 前缀的路径
 * Phase 1: 原样返回路径（英文为默认，不加前缀）
 * Phase 2: 根据 locale 添加前缀
 */
export function localePath(path: string, _locale: Locale = DEFAULT_LOCALE): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const prefix = LOCALE_PATH_PREFIXES[_locale] ?? '';
  return `${prefix}${normalizedPath}`.replace(/\/{2,}/g, '/');
}

/**
 * 获取所有支持的 locale 列表（用于 getStaticPaths）
 */
export function getSupportedLocales(): Locale[] {
  return Object.keys(locales) as Locale[];
}

export function getLocalePrefix(locale: Locale): string {
  return LOCALE_PATH_PREFIXES[locale] ?? '';
}

export function getHreflang(locale: Locale): string {
  return locale === 'zh-CN' ? 'zh-CN' : locale;
}

export function withoutLocalePrefix(pathname: string): string {
  const pathWithSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  for (const prefix of Object.values(LOCALE_PATH_PREFIXES).filter(Boolean)) {
    if (pathWithSlash === `${prefix}/`) return '/';
    if (pathWithSlash.startsWith(`${prefix}/`)) return pathWithSlash.slice(prefix.length) || '/';
  }
  return pathWithSlash;
}
