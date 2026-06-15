import type { APIRoute } from "astro";

import { getSitemapPages, renderUrlset } from "../i18n/sitemap";

const SITE = "https://aibeautystylist.com";

export const GET: APIRoute = () =>
  new Response(renderUrlset(SITE, getSitemapPages("zh-tw")), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
