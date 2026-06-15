import type { APIRoute } from "astro";

import { renderSitemapIndex } from "../i18n/sitemap";

const SITE = "https://aibeautystylist.com";

export const GET: APIRoute = () =>
  new Response(renderSitemapIndex(SITE), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
