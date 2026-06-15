import type { AstroCookies } from "astro";

const VISITOR_COOKIE = "abs_visitor";

export function getOrCreateVisitorId(cookies: AstroCookies): string {
  const existing = cookies.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const visitorId = `visitor_${crypto.randomUUID()}`;
  cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return visitorId;
}
