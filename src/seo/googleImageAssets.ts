import { sitemapLastmod } from "../i18n/sitemap";

export interface GoogleImageAsset {
  readonly sourcePin: string;
  readonly pageUrl: string;
  readonly imageUrl: string;
  readonly title: string;
  readonly caption: string;
}

export const googleImageAssets: readonly GoogleImageAsset[] = [
  {
    sourcePin: "ai_makeup_tryon_01",
    pageUrl: "/ai-makeup-try-on",
    imageUrl: "/images/article-ai-tryon-comparison.webp",
    title: "AI makeup try-on preview from a selfie",
    caption:
      "A realistic AI makeup try-on comparison that helps users preview lipstick, blush, and eye makeup before choosing a look.",
  },
  {
    sourcePin: "pin_5min_01",
    pageUrl: "/scenarios/quick-5min",
    imageUrl: "/images/look-five-minute-beginner.webp",
    title: "5-minute makeup preview for an everyday routine",
    caption:
      "A natural five-minute makeup direction for fast mornings, simple workdays, and casual photos.",
  },
  {
    sourcePin: "pin_soft_glam_01",
    pageUrl: "/looks/soft-glam",
    imageUrl: "/images/look-refined.webp",
    title: "Soft glam makeup preview with refined neutral tones",
    caption:
      "A polished soft glam makeup look with balanced eyes, glowing skin, and wearable rose-neutral color.",
  },
  {
    sourcePin: "pin_wedding_guest_01",
    pageUrl: "/scenarios/wedding-guest",
    imageUrl: "/images/look-wedding-guest.webp",
    title: "Wedding guest makeup preview for daylight and flash",
    caption:
      "An elegant wedding guest makeup look designed to feel polished in person and balanced in photos.",
  },
  {
    sourcePin: "pin_5min_real_morning_02",
    pageUrl: "/scenarios/quick-5min",
    imageUrl: "/images/pinterest/quick-5min-real-morning.webp",
    title: "5-minute makeup in real morning light",
    caption:
      "A realistic morning-light makeup look for users who want a quick routine that still looks fresh and intentional.",
  },
  {
    sourcePin: "pin_office_real_workday_01",
    pageUrl: "/scenarios/office",
    imageUrl: "/images/pinterest/office-real-workday.webp",
    title: "Office makeup preview in natural workday light",
    caption:
      "A natural office makeup look for meetings, interviews, video calls, and everyday professional confidence.",
  },
  {
    sourcePin: "pin_date_night_candlelight_01",
    pageUrl: "/scenarios/first-date",
    imageUrl: "/images/pinterest/date-night-real-candlelight.webp",
    title: "Date night makeup preview in warm low light",
    caption:
      "A soft mauve date-night makeup look that keeps the face natural while adding warmth for evening light.",
  },
  {
    sourcePin: "pin_hooded_visible_shadow_01",
    pageUrl: "/for/hooded-eyes",
    imageUrl: "/images/pinterest/hooded-eyes-visible-shadow.webp",
    title: "Hooded eyes makeup preview with visible shadow placement",
    caption:
      "A realistic hooded-eyes makeup look with lifted eyeshadow placement and thin liner that stays visible.",
  },
  {
    sourcePin: "pin_passport_no_flashback_01",
    pageUrl: "/scenarios/passport-photo",
    imageUrl: "/images/pinterest/passport-photo-no-flashback.webp",
    title: "Passport photo makeup preview without flashback",
    caption:
      "A realistic satin-matte passport photo makeup direction that keeps skin clean under direct flash without flattening the face.",
  },
  {
    sourcePin: "pin_glass_skin_not_greasy_01",
    pageUrl: "/looks/glass-skin",
    imageUrl: "/images/pinterest/glass-skin-not-greasy.webp",
    title: "Glass skin makeup preview without looking greasy",
    caption:
      "A realistic glass-skin makeup look with controlled glow on the high points of the face instead of all-over shine.",
  },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function groupAssetsByPage(assets: readonly GoogleImageAsset[]) {
  const byPage = new Map<string, GoogleImageAsset[]>();

  for (const asset of assets) {
    const pageAssets = byPage.get(asset.pageUrl) ?? [];
    pageAssets.push(asset);
    byPage.set(asset.pageUrl, pageAssets);
  }

  return [...byPage.entries()];
}

export function renderGoogleImageSitemap(
  site: string,
  assets: readonly GoogleImageAsset[] = googleImageAssets,
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${groupAssetsByPage(assets)
  .map(([pageUrl, pageAssets]) => {
    const images = pageAssets
      .map(
        (asset) => `    <image:image>
      <image:loc>${escapeXml(new URL(asset.imageUrl, site).href)}</image:loc>
      <image:title>${escapeXml(asset.title)}</image:title>
      <image:caption>${escapeXml(asset.caption)}</image:caption>
    </image:image>`,
      )
      .join("\n");

    return `  <url>
    <loc>${escapeXml(new URL(pageUrl, site).href)}</loc>
    <lastmod>${sitemapLastmod}</lastmod>
${images}
  </url>`;
  })
  .join("\n")}
</urlset>`;
}
