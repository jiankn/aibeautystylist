import { defineMiddleware } from "astro:middleware";
import { localeStorage, normalizeLocale } from "./lib/i18n";
import {
  isInfrastructurePath,
  resolveLocaleRoute,
  shouldRewriteLocaleRoute,
} from "./i18n/routing";
import { resolveAudienceContext } from "./data/makeup/resolveAudienceContext";
import { AUTH_COOKIE, resolveSessionUserId } from "./lib/authSession";
import { getUserContentPreferences } from "./lib/contentPreferences";
import { getRuntimeBindings } from "./lib/runtime";

/**
 * 全局中间件：多语言上下文注入、Audience Context 注入、安全头、CORS 和请求日志。
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, request, url } = context;

  if (
    (request.method === "GET" || request.method === "HEAD") &&
    url.pathname.length > 1 &&
    url.pathname.endsWith("/")
  ) {
    const target = new URL(url);
    target.pathname = target.pathname.replace(/\/+$/, "");
    return Response.redirect(target, 308);
  }

  const localeRoute = resolveLocaleRoute(url.pathname);

  // 1. 获取语言偏好。URL 前缀优先，其次 Cookie，再其次 Accept-Language。
  const cookieLocale = cookies.get("abs_locale")?.value;
  const acceptLang = request.headers.get("accept-language");
  const locale = localeRoute.hasLocalePrefix
    ? localeRoute.language.locale
    : isInfrastructurePath(url.pathname)
      ? normalizeLocale(cookieLocale || acceptLang)
      : "en";
  context.locals.localeRoute = localeRoute;

  if (!isInfrastructurePath(url.pathname)) {
    cookies.set("abs_locale", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  // 2. 解析 Audience Context：账户偏好优先，其次 Cookie 与 locale。
  let userPreferences;
  const { DB } = getRuntimeBindings();
  if (DB) {
    try {
      const userId = await resolveSessionUserId(
        cookies.get(AUTH_COOKIE)?.value,
        DB,
      );
      if (userId) userPreferences = await getUserContentPreferences(userId, DB);
    } catch {
      // 偏好表尚未迁移或读取失败时，页面仍可使用 Cookie/locale 安全回退。
    }
  }
  const audienceContext = resolveAudienceContext(
    locale,
    cookies,
    userPreferences,
  );
  context.locals.audienceContext = audienceContext;

  // 2b. 注入当前用户（登录/匿名），供页面做条件渲染。
  let isLoggedIn = false;
  if (DB) {
    try {
      const userId = await resolveSessionUserId(
        cookies.get(AUTH_COOKIE)?.value,
        DB,
      );
      isLoggedIn = !!userId;
    } catch {
      /* ignore */
    }
  }
  context.locals.isLoggedIn = isLoggedIn;

  // 3. 在 i18n 的 AsyncLocalStorage 上下文内运行页面生成与响应头组装
  return localeStorage.run(locale, async () => {
    let rewriteTarget: URL | undefined;
    if (shouldRewriteLocaleRoute(url.pathname)) {
      rewriteTarget = new URL(url);
      rewriteTarget.pathname = localeRoute.routePathname;
    }

    const response = await next(rewriteTarget);

    // 安全头。
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );

    // CSP：允许内联脚本（Astro is:inline 需要）、同源资源、Google Fonts。
    const isApi = url.pathname.startsWith("/api/");
    if (!isApi) {
      response.headers.set(
        "Content-Security-Policy",
        [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob: https:",
          "connect-src 'self' https://api.stripe.com",
          "frame-src https://js.stripe.com https://hooks.stripe.com",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; "),
      );
    }

    // API CORS 预检。
    if (isApi) {
      const origin = request.headers.get("origin") || "";
      const allowed = [
        "http://localhost:4321",
        "http://localhost:3000",
        "https://aibeautystylist.com",
      ];
      if (allowed.includes(origin)) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Credentials", "true");
        response.headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS",
        );
        response.headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization",
        );
      }
    }

    return response;
  });
});
