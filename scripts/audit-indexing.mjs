import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const SITE_ORIGIN = 'https://aibeautystylist.com';
const root = process.cwd();
const distClient = path.join(root, 'dist', 'client');
const sitemapIndexPath = path.join(distClient, 'sitemap-index.xml');
const robotsPath = path.join(distClient, 'robots.txt');
const excludedPrefixes = [
  '/api/',
  '/admin/',
  '/dashboard/',
  '/login/',
  '/forgot-password/',
  '/reset-password/',
];
const ssrIndexableUrls = new Set([
  `${SITE_ORIGIN}/`,
]);

const errors = [];
const warnings = [];

const addError = (message) => errors.push(message);
const addWarning = (message) => warnings.push(message);

const normalizePageUrl = (href) => {
  const url = new URL(href, SITE_ORIGIN);
  if (url.origin !== SITE_ORIGIN) return null;
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_astro/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/admin/') ||
    url.pathname.startsWith('/dashboard/') ||
    url.pathname.startsWith('/login/') ||
    url.pathname.startsWith('/forgot-password/') ||
    url.pathname.startsWith('/reset-password/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname === '/robots.txt' ||
    url.pathname === '/sitemap.xml' ||
    url.pathname === '/sitemap-index.xml' ||
    /^\/sitemap-\d+\.xml$/.test(url.pathname)
  ) {
    return null;
  }
  const pathWithSlash = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
  return `${SITE_ORIGIN}${pathWithSlash}`;
};

const htmlPathForUrl = (loc) => {
  const url = new URL(loc);
  const cleanPath = url.pathname.replace(/^\/+|\/+$/g, '');
  if (!cleanPath) return path.join(distClient, 'index.html');
  return path.join(distClient, cleanPath, 'index.html');
};

const getMatch = (html, pattern) => {
  const match = html.match(pattern);
  return match?.[1]?.trim() ?? '';
};

const stripHtml = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const countCjkChars = (text) => (text.match(/[\u3400-\u9fff]/g) ?? []).length;

const expectedLangForUrl = (loc) => {
  const url = new URL(loc);
  if (url.pathname.startsWith('/zh/')) return 'zh-CN';
  return 'en';
};

const sitemapFilePathForUrl = (loc) => {
  const url = new URL(loc);
  if (url.origin !== SITE_ORIGIN) return null;
  const fileName = path.basename(url.pathname);
  if (!/^sitemap-\d+\.xml$/.test(fileName)) return null;
  return path.join(distClient, fileName);
};

const readSitemapLocs = () => {
  const sitemapIndexXml = readFileSync(sitemapIndexPath, 'utf8');
  const sitemapLocs = [...sitemapIndexXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
  const pageLocs = [];

  if (sitemapLocs.length === 0) addError('sitemap-index.xml has no child sitemap <loc> entries.');

  for (const sitemapLoc of sitemapLocs) {
    let parsed;
    try {
      parsed = new URL(sitemapLoc);
    } catch {
      addError(`Invalid child sitemap URL: ${sitemapLoc}`);
      continue;
    }

    if (parsed.origin !== SITE_ORIGIN) addError(`Unexpected child sitemap host: ${sitemapLoc}`);
    if (!/^\/sitemap-\d+\.xml$/.test(parsed.pathname)) addError(`Unexpected child sitemap path: ${sitemapLoc}`);

    const sitemapFile = sitemapFilePathForUrl(sitemapLoc);
    if (!sitemapFile || !existsSync(sitemapFile)) {
      addError(`Child sitemap file does not exist: ${sitemapLoc}`);
      continue;
    }

    const sitemapXml = readFileSync(sitemapFile, 'utf8');
    pageLocs.push(...[...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim()));
  }

  return pageLocs;
};

const listHtmlPages = (dir, prefix = '') => {
  const pages = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    const routePrefix = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) {
      pages.push(...listHtmlPages(absolute, routePrefix));
      continue;
    }
    if (entry.name !== 'index.html') continue;
    const normalized = prefix ? `${SITE_ORIGIN}${prefix}/` : `${SITE_ORIGIN}/`;
    pages.push(normalized.replace(/\/+/g, '/').replace('https:/', 'https://'));
  }
  return pages;
};

if (!existsSync(distClient)) {
  addError('dist/client does not exist. Run npm run build before audit:indexing.');
}

if (!existsSync(sitemapIndexPath)) {
  addError('dist/client/sitemap-index.xml does not exist.');
}

if (!existsSync(robotsPath)) {
  addError('dist/client/robots.txt does not exist.');
} else {
  const robots = readFileSync(robotsPath, 'utf8');
  if (!robots.includes(`${SITE_ORIGIN}/sitemap-index.xml`)) {
    addError('robots.txt must reference sitemap-index.xml.');
  }
}

if (errors.length === 0) {
  const locs = readSitemapLocs();
  const locSet = new Set(locs);
  const titleMap = new Map();
  const descriptionMap = new Map();
  const incoming = new Map(locs.map((loc) => [loc, 0]));

  if (locs.length === 0) addError('sitemap children have no page <loc> entries.');
  if (locSet.size !== locs.length) addError('sitemap contains duplicate page URLs.');

  for (const loc of locs) {
    let parsed;
    try {
      parsed = new URL(loc);
    } catch {
      addError(`Invalid sitemap URL: ${loc}`);
      continue;
    }

    if (parsed.origin !== SITE_ORIGIN) addError(`Unexpected sitemap host: ${loc}`);
    if (parsed.search) addError(`Sitemap URL must not include query params: ${loc}`);
    if (!parsed.pathname.endsWith('/')) addError(`Sitemap URL should use trailing slash to match canonical: ${loc}`);
    if (excludedPrefixes.some((prefix) => parsed.pathname.startsWith(prefix))) {
      addError(`Non-indexable route is present in sitemap: ${loc}`);
    }

    const htmlPath = htmlPathForUrl(loc);
    if (!existsSync(htmlPath)) {
      if (!ssrIndexableUrls.has(loc)) addError(`Sitemap URL has no prerendered HTML: ${loc}`);
      continue;
    }

    const html = readFileSync(htmlPath, 'utf8');
    const title = getMatch(html, /<title>([\s\S]*?)<\/title>/i);
    const description = getMatch(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
    const canonical = getMatch(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
    const robots = getMatch(html, /<meta\s+name="robots"\s+content="([^"]*)"/i);
    const htmlLang = getMatch(html, /<html[^>]*\slang="([^"]*)"/i);
    const h1Count = (html.match(/<h1\b/gi) ?? []).length;
    const hasJsonLd = /<script\s+type="application\/ld\+json"/i.test(html);
    const visibleText = stripHtml(html);
    const wordCount = visibleText.split(/\s+/).filter(Boolean).length;
    const cjkCount = countCjkChars(visibleText);
    const expectedLang = expectedLangForUrl(loc);

    if (!title) addError(`Missing <title>: ${loc}`);
    if (!description) addError(`Missing meta description: ${loc}`);
    if (!canonical) addError(`Missing canonical: ${loc}`);
    if (canonical && canonical !== loc) addError(`Canonical mismatch for ${loc}: ${canonical}`);
    if (!htmlLang) addError(`Missing html lang: ${loc}`);
    if (htmlLang && htmlLang !== expectedLang) addError(`Expected html lang ${expectedLang} for ${loc}, found ${htmlLang}.`);
    if (robots.toLowerCase().includes('noindex')) addError(`Sitemap URL is marked noindex: ${loc}`);
    if (h1Count !== 1) addError(`Expected exactly one H1 for ${loc}, found ${h1Count}.`);
    if (wordCount < 120 && cjkCount < 180) addWarning(`Low visible word count (${wordCount}) for ${loc}`);
    if (!hasJsonLd && !/\/privacy\/|\/terms\/|\/membership\//.test(loc)) {
      addWarning(`No JSON-LD structured data found for ${loc}`);
    }

    if (title) {
      const list = titleMap.get(title) ?? [];
      list.push(loc);
      titleMap.set(title, list);
    }
    if (description) {
      const list = descriptionMap.get(description) ?? [];
      list.push(loc);
      descriptionMap.set(description, list);
    }

    for (const hrefMatch of html.matchAll(/\shref="([^"]+)"/gi)) {
      const href = hrefMatch[1];
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
      const normalized = normalizePageUrl(href);
      if (normalized && incoming.has(normalized)) {
        incoming.set(normalized, (incoming.get(normalized) ?? 0) + 1);
      }
    }
  }

  for (const [title, urls] of titleMap.entries()) {
    if (urls.length > 1) addError(`Duplicate title "${title}" on: ${urls.join(', ')}`);
  }
  for (const [description, urls] of descriptionMap.entries()) {
    if (urls.length > 1) addError(`Duplicate meta description "${description}" on: ${urls.join(', ')}`);
  }

  for (const [loc, count] of incoming.entries()) {
    if (loc === `${SITE_ORIGIN}/`) continue;
    if (count === 0) addWarning(`No internal incoming links found for sitemap URL: ${loc}`);
  }

  const generatedHtmlPages = listHtmlPages(distClient).filter((url) => {
    if (url.endsWith('/404/')) return false;
    const parsed = new URL(url);
    return !excludedPrefixes.some((prefix) => parsed.pathname.startsWith(prefix));
  });
  for (const url of generatedHtmlPages) {
    if (!locSet.has(url)) addWarning(`Prerendered HTML page is not in sitemap: ${url}`);
  }

  console.log(`Indexing audit checked ${locs.length} sitemap URLs.`);
}

if (warnings.length) {
  console.warn('\nWarnings:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error('\nErrors:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Indexing audit passed.');
