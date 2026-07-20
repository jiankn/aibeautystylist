import { describe, expect, it } from "vitest";

import { googleImageAssets } from "./googleImageAssets";
import {
  buildDirectImageLandingUrl,
  getDirectImageNavigationResponse,
  getGoogleImageWorkerFirstPaths,
  isDirectImageDocumentNavigation,
} from "./googleImageDirectNavigation";

const SITE = "https://aibeautystylist.com";
const QUICK5_IMAGE = "/images/pinterest/quick-5min-real-morning.webp";

function makeRequest(
  path: string,
  headers: Record<string, string>,
  method = "GET",
) {
  return new Request(new URL(path, SITE), { method, headers });
}

describe("Google Images direct navigation", () => {
  it("keeps the Worker-first path list aligned with all indexed images", () => {
    expect(getGoogleImageWorkerFirstPaths()).toEqual(
      googleImageAssets.map((asset) => asset.imageUrl),
    );
    expect(getGoogleImageWorkerFirstPaths()).toHaveLength(20);
  });

  it("redirects a browser document navigation to the matching landing page", () => {
    const request = makeRequest(QUICK5_IMAGE, {
      accept: "text/html,application/xhtml+xml,image/avif,image/webp,*/*",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "user-agent": "Mozilla/5.0",
    });

    const response = getDirectImageNavigationResponse(request);

    expect(response?.status).toBe(302);
    expect(response?.headers.get("cache-control")).toBe("private, no-store");
    const location = new URL(response?.headers.get("location") ?? SITE);
    expect(location.pathname).toBe("/scenarios/quick-5min");
    expect(location.searchParams.get("source")).toBe("google_image_direct");
    expect(location.searchParams.get("utm_source")).toBe("google_images");
    expect(location.searchParams.get("utm_content")).toBe(
      "google_image_direct_pin_5min_real_morning_02",
    );
  });

  it("does not redirect an image element request", () => {
    const request = makeRequest(QUICK5_IMAGE, {
      accept: "image/avif,image/webp,image/*,*/*",
      "sec-fetch-dest": "image",
      "sec-fetch-mode": "no-cors",
      "user-agent": "Mozilla/5.0",
    });

    expect(isDirectImageDocumentNavigation(request)).toBe(false);
    expect(getDirectImageNavigationResponse(request)).toBeUndefined();
  });

  it("does not redirect Googlebot-Image even with ambiguous headers", () => {
    const request = makeRequest(QUICK5_IMAGE, {
      accept: "text/html,image/webp,*/*",
      "sec-fetch-dest": "document",
      "user-agent": "Googlebot-Image/1.0",
    });

    expect(getDirectImageNavigationResponse(request)).toBeUndefined();
  });

  it("does not redirect unknown images or non-navigation requests", () => {
    const unknown = makeRequest("/images/unknown.webp", {
      accept: "text/html",
      "sec-fetch-dest": "document",
      "user-agent": "Mozilla/5.0",
    });
    const directImageFetch = makeRequest(QUICK5_IMAGE, {
      accept: "image/webp,*/*",
      "user-agent": "Mozilla/5.0",
    });

    expect(getDirectImageNavigationResponse(unknown)).toBeUndefined();
    expect(getDirectImageNavigationResponse(directImageFetch)).toBeUndefined();
  });

  it("builds a unique tracked landing URL for every indexed image", () => {
    for (const asset of googleImageAssets) {
      const target = buildDirectImageLandingUrl(SITE, asset);
      expect(target.pathname).toBe(asset.pageUrl);
      expect(target.searchParams.get("utm_content")).toBe(
        `google_image_direct_${asset.sourcePin}`,
      );
    }
  });
});
