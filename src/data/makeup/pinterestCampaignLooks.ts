export const pinterestCampaignLookIds = [
  "burgundy_velvet_editorial_v1",
  "champagne_eye_glow_editorial_v1",
  "sunset_bronze_editorial_v1",
  "cloud_skin_editorial_v1",
  "french_natural_editorial_v1",
  "soft_berry_stain_editorial_v1",
] as const;

export type PinterestCampaignLookId = (typeof pinterestCampaignLookIds)[number];

export interface PinterestCampaignLook {
  id: PinterestCampaignLookId;
  lookSlug: string;
  visualKey: string;
  sources: readonly string[];
  utmContents: readonly string[];
  generationDirection: string;
  qualityTarget: string;
}

const pinterestCampaignLooks: readonly PinterestCampaignLook[] = [
  {
    id: "burgundy_velvet_editorial_v1",
    lookSlug: "burgundy-velvet",
    visualKey: "burgundy_velvet_editorial",
    sources: ["pinterest_burgundy_velvet", "google_images_burgundy_velvet"],
    utmContents: [
      "pin_burgundy_velvet_editorial_01",
      "google_image_burgundy_velvet_01",
    ],
    generationDirection:
      "Campaign-specific Burgundy Velvet direction: create wine-plum and muted burgundy eyes concentrated along the upper lash line and outer corner, with a softly diffused brown-plum edge and restrained satin depth across the lid. Keep the inner eye lighter and avoid a solid red block or black smoky eye. Use softly sculpted brows, a subtle muted rose-bronze cheek flush, realistic satin skin with visible texture, and a deep burgundy-berry velvet lip that preserves natural lip lines. Keep the overall contrast polished and editorial, not gothic, overdrawn, glossy-black, or heavily contoured.",
    qualityTarget:
      "wine-plum softly diffused eyes with lighter inner corners, restrained rose-bronze cheeks, realistic satin skin, and a deep burgundy-berry velvet lip with natural lip texture",
  },
  {
    id: "champagne_eye_glow_editorial_v1",
    lookSlug: "reflective-lid-glow",
    visualKey: "champagne_eye_glow_editorial",
    sources: ["pinterest_champagne_eye", "google_images_champagne_eye"],
    utmContents: [
      "pin_champagne_eye_glow_editorial_01",
      "google_image_champagne_eye_01",
    ],
    generationDirection:
      "Campaign-specific Champagne Eye Glow direction: apply a thin, refined champagne-gold reflective layer to the mobile lid, strongest at the center lid and lighter at the inner corner. Define the crease and outer corner with softly diffused warm cocoa-brown matte shadow so the metallic light has a clean boundary. Add precise lash definition without a heavy black wing or chunky glitter. Keep real eyelid and skin texture visible, use a quiet warm-apricot blush, softly luminous satin skin, and a sheer neutral caramel-nude lip so the eyes remain the focal point. The result must look polished and photographic, never frosted, glittery, oily, or metallic across the whole face.",
    qualityTarget:
      "controlled champagne-gold reflection centered on the mobile lids, softly diffused cocoa-brown crease depth, precise lashes, warm-apricot cheeks, realistic satin skin, and a sheer neutral nude lip",
  },
  {
    id: "sunset_bronze_editorial_v1",
    lookSlug: "vacation-bronze",
    visualKey: "sunset_bronze_editorial",
    sources: ["pinterest_sunset_bronze", "google_images_sunset_bronze"],
    utmContents: [
      "pin_sunset_bronze_editorial_01",
      "google_image_sunset_bronze_01",
    ],
    generationDirection:
      "Campaign-specific Sunset Bronze direction: create softly diffused warm bronze and muted antique-gold eyes concentrated on the mobile lids, with cocoa-brown depth at the outer corners and clean separated lashes. Keep the bronze warm but never orange, metallic across the whole eye, or heavily smoked. Use realistic satin skin with natural tonal variation and visible texture, sun-warmed terracotta-peach blush swept high on the cheeks, restrained golden light only on facial high points, natural full brows, and a caramel-rose nude lip with visible lip lines. The result should feel polished by real late-afternoon light, not heavily contoured, greasy, filtered, or beach-costume themed.",
    qualityTarget:
      "warm bronze and muted antique-gold lids with cocoa outer-corner depth, terracotta-peach cheeks, realistic satin skin, restrained golden highlights, and a caramel-rose nude lip with natural texture",
  },
  {
    id: "cloud_skin_editorial_v1",
    lookSlug: "cloud-skin-matte",
    visualKey: "cloud_skin_editorial",
    sources: ["pinterest_cloud_skin", "google_images_cloud_skin"],
    utmContents: ["pin_cloud_skin_editorial_01", "google_image_cloud_skin_01"],
    generationDirection:
      "Campaign-specific Cloud Skin direction: create a thin, softly diffused satin-matte complexion that controls shine while preserving pores, fine facial texture, natural tonal variation, and subtle expression lines. Keep coverage even but never flat, chalky, blurred, grey, or mask-like. Add a softly blurred cool rose-plum blush, quiet taupe-brown matte eyes with delicate lash definition, natural feathered brows, and a muted rose-brown lip with visible lip lines. Preserve dimensional facial structure through realistic light and shadow instead of strong contour or glossy highlight.",
    qualityTarget:
      "texture-preserving satin-matte cloud skin without ashiness, softly blurred rose-plum cheeks, quiet taupe eyes, feathered brows, and a muted rose-brown lip with natural texture",
  },
  {
    id: "french_natural_editorial_v1",
    lookSlug: "french-natural-chic",
    visualKey: "french_natural_editorial",
    sources: ["pinterest_french_natural", "google_images_french_natural"],
    utmContents: [
      "pin_french_natural_editorial_01",
      "google_image_french_natural_01",
    ],
    generationDirection:
      "Campaign-specific French Natural Chic direction: keep the complexion sheer and satin with pores, freckles, fine facial texture, and natural tonal variation visible. Define the eyes with a thin veil of taupe-brown close to the lashes, clean separated lashes, and softly brushed brows; avoid a dark wing, smoky eye, or obvious cut crease. Add a restrained muted rose flush that looks like real circulation and a softly blurred rosewood lip with visible natural lip lines. Preserve subtle asymmetry and quiet elegance so the result feels effortless in real window light, never heavily contoured, glossy, beige-washed, or filtered.",
    qualityTarget:
      "sheer realistic satin skin, softly defined taupe-brown eyes, separated lashes, naturally brushed brows, a restrained muted rose flush, and a blurred rosewood lip with natural texture",
  },
  {
    id: "soft_berry_stain_editorial_v1",
    lookSlug: "soft-berry-stain",
    visualKey: "soft_berry_stain_editorial",
    sources: ["pinterest_soft_berry", "google_images_soft_berry"],
    utmContents: [
      "pin_soft_berry_stain_editorial_01",
      "google_image_soft_berry_01",
    ],
    generationDirection:
      "Campaign-specific Soft Berry Stain direction: create a translucent crushed-berry lip stain with the richest color softly concentrated toward the inner lips and diffused edges, while preserving natural lip lines and avoiding an opaque lipstick shape. Echo the lip with a sheer cool berry-plum flush placed high on the cheeks. Keep the eyes quiet with softly diffused cocoa-taupe shadow, precise separated lashes, and natural full brows. Preserve medium-deep skin depth, pores, tonal variation, and realistic satin light; never make the complexion ashy, purple-washed, blurred, heavily contoured, or glossy.",
    qualityTarget:
      "a translucent crushed-berry lip stain with diffused edges, sheer berry-plum cheeks, quiet cocoa-taupe eyes, precise lashes, and realistic medium-deep satin skin without ashiness",
  },
];

export function getPinterestCampaignLook(
  value: unknown,
  lookSlug?: string,
): PinterestCampaignLook | undefined {
  if (typeof value !== "string") return undefined;
  const campaign = pinterestCampaignLooks.find((item) => item.id === value);
  return campaign && (!lookSlug || campaign.lookSlug === lookSlug)
    ? campaign
    : undefined;
}

export function resolvePinterestCampaignLook(input: {
  lookSlug?: string;
  visualKey?: string | null;
  source?: string | null;
  utmContent?: string | null;
}): PinterestCampaignLook | undefined {
  if (!input.lookSlug) return undefined;
  return pinterestCampaignLooks.find(
    (campaign) =>
      campaign.lookSlug === input.lookSlug &&
      ((input.visualKey && campaign.visualKey === input.visualKey) ||
        (input.source && campaign.sources.includes(input.source)) ||
        (input.utmContent && campaign.utmContents.includes(input.utmContent))),
  );
}
