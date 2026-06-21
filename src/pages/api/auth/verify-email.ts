import type { APIRoute } from "astro";

import { markEmailVerified } from "../../../lib/accounts";
import {
  consumeOneTimeToken,
  createSession,
  setSessionCookie,
} from "../../../lib/authSession";
import { getLanguageByLocale, defaultLanguage } from "../../../i18n/config";
import { getLocalizedAppHref } from "../../../i18n/routing";
import { normalizeLocale, type SupportedLocale } from "../../../lib/i18n";
import { getRuntimeBindings } from "../../../lib/runtime";

function localizedRedirectPath(path: string, locale: SupportedLocale): string {
  const languageSlug = (getLanguageByLocale(locale) ?? defaultLanguage).slug;
  return getLocalizedAppHref(path, languageSlug);
}

// GET：用户点击邮件链接。校验 token → 标记已验证 → 直接登录 → 跳转。
export const GET: APIRoute = async ({ cookies, request, redirect }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const locale = normalizeLocale(url.searchParams.get("locale"));
  const invalidRedirect = localizedRedirectPath(
    "/login?verify=invalid",
    locale,
  );
  const { DB } = getRuntimeBindings();
  if (!DB || !token) {
    return redirect(invalidRedirect, 302);
  }

  const userId = await consumeOneTimeToken(token, "email_verify", DB);
  if (!userId) {
    return redirect(invalidRedirect, 302);
  }

  await markEmailVerified(userId, DB);
  const session = await createSession(userId, DB);
  setSessionCookie(cookies, session.token, import.meta.env.PROD);
  return redirect(localizedRedirectPath("/?verify=success", locale), 302);
};
