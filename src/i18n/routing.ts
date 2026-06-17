import {
  defaultLanguage,
  getLanguageByPathPrefix,
  getLanguageBySlug,
  type LanguageConfig,
  type LanguageSlug,
} from "./config";
import {
  getLocalizedSeoGroupForRoute,
  getLocalizedPathForRoute,
  hasLocalizedSeoPageForRoute,
} from "./localizedSeoPages";

export interface LocaleRoute {
  readonly originalPathname: string;
  readonly routePathname: string;
  readonly language: LanguageConfig;
  readonly hasLocalePrefix: boolean;
  readonly pathPrefix: string;
}

function normalizePathname(pathname: string): string {
  if (!pathname.startsWith("/")) return `/${pathname}`;
  return pathname || "/";
}

function normalizeRoutePathname(pathname: string): string {
  const normalized = normalizePathname(pathname);
  let decoded = normalized;
  try {
    decoded = decodeURI(normalized);
  } catch {
    decoded = normalized;
  }
  if (decoded === "/") return "/";
  return decoded.replace(/\/+$/, "") || "/";
}

export function resolveLocaleRoute(pathname: string): LocaleRoute {
  const normalized = normalizeRoutePathname(pathname);
  const segments = normalized.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();
  const language = getLanguageByPathPrefix(firstSegment);

  if (!language) {
    return {
      originalPathname: normalized,
      routePathname: normalized,
      language: defaultLanguage,
      hasLocalePrefix: false,
      pathPrefix: "",
    };
  }

  const routePathname = normalizeRoutePathname(
    `/${segments.slice(1).join("/")}`,
  );

  return {
    originalPathname: normalized,
    routePathname,
    language,
    hasLocalePrefix: true,
    pathPrefix: language.pathPrefix,
  };
}

export function addLocalePrefix(
  pathname: string,
  languageSlug: LanguageSlug | string,
): string {
  const language = getLanguageBySlug(languageSlug) ?? defaultLanguage;
  const normalized = normalizeRoutePathname(pathname);

  if (!language.pathPrefix) return normalized;
  if (normalized === "/") return `/${language.pathPrefix}`;
  return `/${language.pathPrefix}${normalized}`;
}

export function getLocalizedPathname(
  pathname: string,
  languageSlug: LanguageSlug | string,
): string {
  const route = resolveLocaleRoute(pathname);
  const localizedPath = getLocalizedPathForRoute(
    route.language.slug,
    route.routePathname,
    languageSlug,
  );
  return addLocalePrefix(localizedPath ?? route.routePathname, languageSlug);
}

export function getLanguageSwitchPathname(
  pathname: string,
  languageSlug: LanguageSlug | string,
): string {
  const route = resolveLocaleRoute(pathname);
  const localizedPath = getLocalizedPathForRoute(
    route.language.slug,
    route.routePathname,
    languageSlug,
  );

  if (localizedPath) return addLocalePrefix(localizedPath, languageSlug);

  const seoGroup = getLocalizedSeoGroupForRoute(
    route.language.slug,
    route.routePathname,
  );

  if (seoGroup) return seoGroup.englishPath;

  return getLocalizedPathname(pathname, languageSlug);
}

export function getLocalizedAppHref(
  href: string,
  languageSlug: LanguageSlug | string,
): string {
  if (
    href.startsWith("#") ||
    href.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(href)
  ) {
    return href;
  }
  const suffixStart = href.search(/[?#]/);
  const pathname = suffixStart === -1 ? href : href.slice(0, suffixStart);
  const suffix = suffixStart === -1 ? "" : href.slice(suffixStart);
  return `${addLocalePrefix(pathname, languageSlug)}${suffix}`;
}

export function isInfrastructurePath(pathname: string): boolean {
  const normalized = normalizeRoutePathname(pathname);
  if (normalized.startsWith("/api/") || normalized === "/api") return true;
  if (normalized.startsWith("/_astro/")) return true;
  if (normalized === "/robots.txt") return true;
  if (normalized === "/sitemap.xml") return true;
  if (normalized === "/sitemap-index.xml") return true;
  if (/^\/sitemap-[a-z0-9-]+\.xml$/i.test(normalized)) return true;
  return false;
}

const localizableAppRoutes = new Set([
  "/about",
  "/account",
  "/ai-disclaimer",
  "/blog",
  "/dashboard",
  "/diagnosis",
  "/discover",
  "/faq",
  "/login",
  "/pricing",
  "/privacy",
  "/reset-password",
  "/share-card",
  "/support",
  "/terms",
  "/tryon-free",
  "/tryon-premium",
  "/tryon-pro",
]);

const appRouteOverrides = new Set(["/pricing"]);

function shouldOverrideLocalizedSeoRoute(pathname: string): boolean {
  if (appRouteOverrides.has(pathname)) return true;
  return pathname === "/blog" || pathname.startsWith("/blog/");
}

function isLocalizableAppRoute(pathname: string): boolean {
  const normalized = normalizeRoutePathname(pathname);
  if (localizableAppRoutes.has(normalized)) return true;
  return normalized.startsWith("/blog/");
}

export function shouldRewriteLocaleRoute(pathname: string): boolean {
  const route = resolveLocaleRoute(pathname);
  if (!route.hasLocalePrefix) return false;
  if (isInfrastructurePath(route.originalPathname)) return false;
  if (isInfrastructurePath(route.routePathname)) return false;
  if (shouldOverrideLocalizedSeoRoute(route.routePathname)) {
    return route.routePathname !== route.originalPathname;
  }
  if (hasLocalizedSeoPageForRoute(route.language.slug, route.routePathname))
    return false;
  if (!isLocalizableAppRoute(route.routePathname)) return false;
  return route.routePathname !== route.originalPathname;
}
