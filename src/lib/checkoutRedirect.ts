import { isInfrastructurePath, resolveLocaleRoute, getLocalizedAppHref } from "../i18n/routing";

const FALLBACK_ORIGIN = "https://aibeautystylist.local";

type CheckoutStatus = "success" | "cancel";

function normalizeInternalPath(
  value: string | null | undefined,
): string | null {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return null;
  }

  try {
    const url = new URL(value, FALLBACK_ORIGIN);
    if (url.origin !== FALLBACK_ORIGIN) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function safeCheckoutPricingPath(
  value: string | null | undefined,
  languageSlug?: string,
): string {
  const normalized = normalizeInternalPath(value);
  const fallbackPath = languageSlug
    ? getLocalizedAppHref("/pricing", languageSlug)
    : "/pricing";

  if (!normalized) return fallbackPath;

  const url = new URL(normalized, FALLBACK_ORIGIN);
  const route = resolveLocaleRoute(url.pathname);
  if (route.routePathname !== "/pricing") return fallbackPath;

  if (languageSlug) {
    const suffix = normalized.slice(url.pathname.length);
    return getLocalizedAppHref(route.routePathname + suffix, languageSlug);
  }
  return route.originalPathname;
}

export function safeCheckoutReturnPath(
  value: string | null | undefined,
  languageSlug?: string,
): string | undefined {
  const normalized = normalizeInternalPath(value);
  if (!normalized) return undefined;

  const url = new URL(normalized, FALLBACK_ORIGIN);
  const route = resolveLocaleRoute(url.pathname);
  if (route.routePathname === "/pricing") return undefined;
  if (isInfrastructurePath(route.originalPathname)) return undefined;
  if (isInfrastructurePath(route.routePathname)) return undefined;

  if (languageSlug) {
    const suffix = normalized.slice(url.pathname.length);
    return getLocalizedAppHref(route.routePathname + suffix, languageSlug);
  }
  return normalized;
}

export function buildCheckoutStatusPath(input: {
  pricingPath?: string | null;
  status: CheckoutStatus;
  returnTo?: string | null;
  languageSlug?: string;
}): string {
  const url = new URL(
    safeCheckoutPricingPath(input.pricingPath, input.languageSlug),
    FALLBACK_ORIGIN,
  );
  url.searchParams.set("checkout", input.status);

  const returnTo = safeCheckoutReturnPath(input.returnTo, input.languageSlug);
  if (returnTo) url.searchParams.set("return_to", returnTo);

  return `${url.pathname}${url.search}`;
}

export function buildCheckoutStatusUrl(input: {
  baseUrl: string;
  pricingPath?: string | null;
  status: CheckoutStatus;
  returnTo?: string | null;
  languageSlug?: string;
}): string {
  const base = new URL(input.baseUrl);
  return new URL(
    buildCheckoutStatusPath({
      pricingPath: input.pricingPath,
      status: input.status,
      returnTo: input.returnTo,
      languageSlug: input.languageSlug,
    }),
    base.origin,
  ).toString();
}
