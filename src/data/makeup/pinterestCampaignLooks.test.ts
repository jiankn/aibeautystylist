import { describe, expect, it } from "vitest";

import {
  getPinterestCampaignLook,
  resolvePinterestCampaignLook,
} from "./pinterestCampaignLooks";

describe("Pinterest campaign looks", () => {
  it("resolves a vetted campaign from its visual and attribution", () => {
    expect(
      resolvePinterestCampaignLook({
        lookSlug: "burgundy-velvet",
        visualKey: "burgundy_velvet_editorial",
      })?.id,
    ).toBe("burgundy_velvet_editorial_v1");

    expect(
      resolvePinterestCampaignLook({
        lookSlug: "reflective-lid-glow",
        utmContent: "pin_champagne_eye_glow_editorial_01",
      })?.id,
    ).toBe("champagne_eye_glow_editorial_v1");

    expect(
      resolvePinterestCampaignLook({
        lookSlug: "vacation-bronze",
        visualKey: "sunset_bronze_editorial",
      })?.id,
    ).toBe("sunset_bronze_editorial_v1");

    expect(
      resolvePinterestCampaignLook({
        lookSlug: "cloud-skin-matte",
        utmContent: "pin_cloud_skin_editorial_01",
      })?.id,
    ).toBe("cloud_skin_editorial_v1");

    expect(
      resolvePinterestCampaignLook({
        lookSlug: "french-natural-chic",
        visualKey: "french_natural_editorial",
      })?.id,
    ).toBe("french_natural_editorial_v1");

    expect(
      resolvePinterestCampaignLook({
        lookSlug: "soft-berry-stain",
        utmContent: "pin_soft_berry_stain_editorial_01",
      })?.id,
    ).toBe("soft_berry_stain_editorial_v1");

    expect(
      resolvePinterestCampaignLook({
        lookSlug: "peach-morning-glow",
        visualKey: "peach_morning_glow_editorial",
      })?.id,
    ).toBe("peach_morning_glow_editorial_v1");

    expect(
      resolvePinterestCampaignLook({
        lookSlug: "executive-rose",
        utmContent: "pin_executive_rose_editorial_01",
      })?.id,
    ).toBe("executive_rose_editorial_v1");
  });

  it("never applies a campaign direction to a different catalog look", () => {
    expect(
      getPinterestCampaignLook(
        "burgundy_velvet_editorial_v1",
        "reflective-lid-glow",
      ),
    ).toBeUndefined();
  });
});
