import type { APIRoute } from "astro";

import { renderGoogleImageSitemap } from "../seo/googleImageAssets";

const SITE = "https://aibeautystylist.com";

export const GET: APIRoute = () =>
  new Response(renderGoogleImageSitemap(SITE), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
