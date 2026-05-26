/**
 * i18n 架构预埋 — 翻译工具函数
 *
 * Phase 1: 仅英文，但文案从 JSON 语言包读取而非硬编码
 * Phase 2: 支持多语言包加载 + URL locale 前缀
 */

import en from '../locales/en.json';

export type Locale = 'en';

// Phase 2 将扩展为动态加载
const locales: Record<Locale, typeof en> = { en };

const DEFAULT_LOCALE: Locale = 'en';

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
  // Phase 2: const segment = url.pathname.split('/')[1];
  // if (segment in locales) return segment as Locale;
  return DEFAULT_LOCALE;
}

/**
 * 生成带 locale 前缀的路径
 * Phase 1: 原样返回路径（英文为默认，不加前缀）
 * Phase 2: 根据 locale 添加前缀
 */
export function localePath(path: string, _locale: Locale = DEFAULT_LOCALE): string {
  // Phase 2: return `/${locale}${path}`;
  return path;
}

/**
 * 获取所有支持的 locale 列表（用于 getStaticPaths）
 */
export function getSupportedLocales(): Locale[] {
  return Object.keys(locales) as Locale[];
}
