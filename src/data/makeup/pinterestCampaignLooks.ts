export const pinterestCampaignLookIds = [
  "burgundy_velvet_editorial_v1",
  "champagne_eye_glow_editorial_v1",
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
