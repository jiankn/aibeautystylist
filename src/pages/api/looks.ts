import type { APIRoute } from "astro";

import { lookCatalog } from "../../data/lookCatalog";
import { resolveLookCatalog } from "../../data/makeup/resolveCatalog";
import {
  enforceLocaleAssetPack,
  resolveAudienceContext,
} from "../../data/makeup/resolveAudienceContext";
import { isValidMarketProfile } from "../../data/makeup/audienceTypes";
import { normalizeLocale } from "../../lib/i18n";
import { apiError, apiSuccess } from "../../lib/http";

/**
 * GET /api/looks
 *
 * 支持参数化查询：
 * - ?locale=pt-BR — 指定 locale
 * - ?marketProfile=east-asia — 指定市场画像
 * - ?legacy=true — 返回旧格式（向后兼容）
 *
 * 无参数时通过中间件注入的 audienceContext 解析。
 */
export const GET: APIRoute = (context) => {
  const url = new URL(context.request.url);
  const legacyMode = url.searchParams.get("legacy") === "true";

  // 向后兼容：无参数且无 audienceContext 时返回旧目录
  if (legacyMode) {
    return apiSuccess({ looks: lookCatalog });
  }

  // 解析 Audience Context
  const paramLocale = url.searchParams.get("locale");
  const locale = paramLocale
    ? normalizeLocale(paramLocale)
    : (context.locals?.audienceContext?.locale ?? normalizeLocale(null));

  const audienceContext = paramLocale
    ? resolveAudienceContext(locale)
    : (context.locals?.audienceContext ??
      resolveAudienceContext(locale, context.cookies));

  // 如果请求明确指定了 marketProfile，覆盖 context 中的值
  const paramMarket = url.searchParams.get("marketProfile");
  if (paramMarket && !isValidMarketProfile(paramMarket)) {
    return apiError(
      {
        code: "INVALID_MARKET_PROFILE",
        message: "marketProfile 参数无效",
        retryable: false,
      },
      422,
    );
  }
  const validatedMarket =
    paramMarket && isValidMarketProfile(paramMarket) ? paramMarket : undefined;
  const effectiveContext = enforceLocaleAssetPack(
    validatedMarket
      ? { ...audienceContext, marketProfile: validatedMarket }
      : audienceContext,
  );

  const resolvedLooks = resolveLookCatalog(effectiveContext);

  return apiSuccess({
    audienceContext: effectiveContext,
    looks: resolvedLooks,
    total: resolvedLooks.length,
  });
};
