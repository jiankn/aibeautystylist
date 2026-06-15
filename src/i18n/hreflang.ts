import {
  defaultLanguage,
  getLanguageBySlug,
  languageConfigs,
  type LanguageSlug,
} from "./config";
import { blogSlugs } from "../data/blogData";
import {
  getLocalizedSeoGroupForRoute,
  hasLocalizedSeoPageForRoute,
} from "./localizedSeoPages";
import { addLocalePrefix, resolveLocaleRoute } from "./routing";

export interface HreflangLink {
  readonly hreflang: string;
  readonly href: string;
  readonly pathname: string;
}

function absoluteUrl(pathname: string, origin: string | URL): string {
  return new URL(pathname, origin).href;
}

function isLocalizedBlogPath(pathname: string): boolean {
  if (pathname === "/blog") return true;
  const match = pathname.match(/^\/blog\/([^/]+)$/);
  return Boolean(match?.[1] && blogSlugs.includes(match[1]));
}

export function hasIndexableLocalizedPath(
  pathname: string,
  languageSlug: LanguageSlug | string,
): boolean {
  const route = resolveLocaleRoute(pathname);
  const language = getLanguageBySlug(languageSlug);
  if (!language) return false;
  if (language.slug === defaultLanguage.slug) return true;
  if (isLocalizedBlogPath(route.routePathname)) return true;
  return hasLocalizedSeoPageForRoute(language.slug, route.routePathname);
}

export function getCanonicalPathname(pathname: string): string {
  const route = resolveLocaleRoute(pathname);
  if (!route.hasLocalePrefix) return route.routePathname;
  if (isLocalizedBlogPath(route.routePathname)) return route.originalPathname;
  if (hasLocalizedSeoPageForRoute(route.language.slug, route.routePathname)) {
    return route.originalPathname;
  }
  return route.routePathname;
}

export function shouldNoindexLocalizedFallback(pathname: string): boolean {
  const route = resolveLocaleRoute(pathname);
  if (!route.hasLocalePrefix) return false;
  return !hasIndexableLocalizedPath(pathname, route.language.slug);
}

export function buildHreflangLinks(
  pathname: string,
  origin: string | URL,
): HreflangLink[] {
  const route = resolveLocaleRoute(pathname);
  const group = getLocalizedSeoGroupForRoute(
    route.language.slug,
    route.routePathname,
  );
  const links: HreflangLink[] = [];

  if (isLocalizedBlogPath(route.routePathname)) {
    for (const language of languageConfigs) {
      const pathname = addLocalePrefix(route.routePathname, language.slug);
      links.push({
        hreflang: language.hreflang,
        href: absoluteUrl(pathname, origin),
        pathname,
      });
    }
    links.push({
      hreflang: "x-default",
      href: absoluteUrl(route.routePathname, origin),
      pathname: route.routePathname,
    });
    return links;
  }

  if (group) {
    links.push({
      hreflang: "en",
      href: absoluteUrl(group.englishPath, origin),
      pathname: group.englishPath,
    });

    for (const page of group.pages) {
      const localizedPathname = addLocalePrefix(page.path, page.languageSlug);
      const language = getLanguageBySlug(page.languageSlug);
      if (!language) continue;
      links.push({
        hreflang: language.hreflang,
        href: absoluteUrl(localizedPathname, origin),
        pathname: localizedPathname,
      });
    }

    links.push({
      hreflang: "x-default",
      href: absoluteUrl(group.englishPath, origin),
      pathname: group.englishPath,
    });

    return links;
  }

  links.push({
    hreflang: "en",
    href: absoluteUrl(route.routePathname, origin),
    pathname: route.routePathname,
  });
  links.push({
    hreflang: "x-default",
    href: absoluteUrl(route.routePathname, origin),
    pathname: route.routePathname,
  });

  return links;
}
