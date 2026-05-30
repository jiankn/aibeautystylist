import type { Locale } from '../i18n';

export function resolveStripeReturnLocale(request: Request, body?: Record<string, unknown>): Locale {
  if (body?.locale === 'zh-CN') return 'zh-CN';
  if (typeof body?.returnPath === 'string' && isZhPath(body.returnPath)) return 'zh-CN';

  const referer = request.headers.get('referer');
  if (!referer) return 'en';

  try {
    return isZhPath(new URL(referer).pathname) ? 'zh-CN' : 'en';
  } catch {
    return 'en';
  }
}

export function membershipReturnPath(locale: Locale): string {
  return locale === 'zh-CN' ? '/zh/membership/' : '/membership';
}

function isZhPath(pathname: string): boolean {
  return pathname === '/zh' || pathname.startsWith('/zh/');
}
