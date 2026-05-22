import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const SITE_ORIGIN = 'https://aibeautystylist.com';
const root = process.cwd();
const distClient = path.join(root, 'dist', 'client');
const sitemapPath = path.join(distClient, 'sitemap.xml');

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
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname === '/robots.txt' ||
    url.pathname === '/sitemap.xml'
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

if (!existsSync(sitemapPath)) {
  addError('dist/client/sitemap.xml does not exist.');
}

if (errors.length === 0) {
  const sitemapXml = readFileSync(sitemapPath, 'utf8');
  const locs = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
  const locSet = new Set(locs);
  const titleMap = new Map();
  const descriptionMap = new Map();
  const incoming = new Map(locs.map((loc) => [loc, 0]));

  if (locs.length === 0) addError('sitemap.xml has no <loc> entries.');
  if (locSet.size !== locs.length) addError('sitemap.xml contains duplicate URLs.');

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

    const htmlPath = htmlPathForUrl(loc);
    if (!existsSync(htmlPath)) {
      addError(`Sitemap URL has no prerendered HTML: ${loc}`);
      continue;
    }

    const html = readFileSync(htmlPath, 'utf8');
    const title = getMatch(html, /<title>([\s\S]*?)<\/title>/i);
    const description = getMatch(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
    const canonical = getMatch(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
    const robots = getMatch(html, /<meta\s+name="robots"\s+content="([^"]*)"/i);
    const h1Count = (html.match(/<h1\b/gi) ?? []).length;
    const hasJsonLd = /<script\s+type="application\/ld\+json"/i.test(html);
    const wordCount = stripHtml(html).split(/\s+/).filter(Boolean).length;

    if (!title) addError(`Missing <title>: ${loc}`);
    if (!description) addError(`Missing meta description: ${loc}`);
    if (!canonical) addError(`Missing canonical: ${loc}`);
    if (canonical && canonical !== loc) addError(`Canonical mismatch for ${loc}: ${canonical}`);
    if (robots.toLowerCase().includes('noindex')) addError(`Sitemap URL is marked noindex: ${loc}`);
    if (h1Count !== 1) addError(`Expected exactly one H1 for ${loc}, found ${h1Count}.`);
    if (wordCount < 120) addWarning(`Low visible word count (${wordCount}) for ${loc}`);
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

  const generatedHtmlPages = listHtmlPages(distClient).filter((url) => !url.endsWith('/404/'));
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
