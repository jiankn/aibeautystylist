import { googleImageAssets, type GoogleImageAsset } from "./googleImageAssets";

const assetsByImagePath = new Map(
  googleImageAssets.map((asset) => [asset.imageUrl, asset]),
);

const crawlerPattern = /bot|crawler|spider|slurp/i;

export function getGoogleImageWorkerFirstPaths(): readonly string[] {
  return googleImageAssets.map((asset) => asset.imageUrl);
}

export function isDirectImageDocumentNavigation(request: Request): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;

  const userAgent = request.headers.get("user-agent") ?? "";
  if (crawlerPattern.test(userAgent)) return false;

  const destination = (
    request.headers.get("sec-fetch-dest") ?? ""
  ).toLowerCase();
  const mode = (request.headers.get("sec-fetch-mode") ?? "").toLowerCase();

  if (destination === "image") return false;
  if (destination === "document" || mode === "navigate") return true;

  const accept = (request.headers.get("accept") ?? "").toLowerCase();
  return accept.includes("text/html");
}

export function getDirectImageLandingAsset(
  request: Request,
): GoogleImageAsset | undefined {
  if (!isDirectImageDocumentNavigation(request)) return undefined;

  return assetsByImagePath.get(new URL(request.url).pathname);
}

export function buildDirectImageLandingUrl(
  requestUrl: string,
  asset: GoogleImageAsset,
): URL {
  const target = new URL(asset.pageUrl, requestUrl);
  target.searchParams.set("source", "google_image_direct");
  target.searchParams.set("utm_source", "google_images");
  target.searchParams.set("utm_medium", "organic_search");
  target.searchParams.set("utm_campaign", "image_retention");
  target.searchParams.set(
    "utm_content",
    `google_image_direct_${asset.sourcePin}`,
  );
  return target;
}

export function getDirectImageNavigationResponse(
  request: Request,
): Response | undefined {
  const asset = getDirectImageLandingAsset(request);
  if (!asset) return undefined;

  const target = buildDirectImageLandingUrl(request.url, asset);
  return new Response(null, {
    status: 302,
    headers: {
      Location: target.href,
      "Cache-Control": "private, no-store",
      Vary: "Sec-Fetch-Dest, Sec-Fetch-Mode, Accept, User-Agent",
    },
  });
}
