import { describe, expect, it } from "vitest";

import { resolveTryOnExperience } from "./tryonExperience";

describe("resolveTryOnExperience", () => {
  it("treats an anonymous visitor as a locked free experience", () => {
    const experience = resolveTryOnExperience({
      authenticated: false,
      planCode: "premium",
    });

    expect(experience).toMatchObject({
      audience: "anonymous",
      planCode: "free",
      authenticated: false,
      showAdvisor: true,
      showMemberGuidance: false,
      showHistoryPreview: false,
    });
    expect(experience.features.hdDownload).toBe(false);
  });

  it("keeps the free workspace focused on the advisor and share reward", () => {
    const experience = resolveTryOnExperience({
      authenticated: true,
      planCode: "free",
    });

    expect(experience.audience).toBe("free");
    expect(experience.showAdvisor).toBe(true);
    expect(experience.features.shareReward).toBe(true);
    expect(experience.features.tutorials).toBe(false);
  });

  it("unlocks member guidance and HD download for Pro", () => {
    const experience = resolveTryOnExperience({
      authenticated: true,
      planCode: "pro",
    });

    expect(experience).toMatchObject({
      audience: "pro",
      planLabel: "Pro",
      showAdvisor: false,
      showMemberGuidance: true,
      showHistoryPreview: true,
    });
    expect(experience.features.hdDownload).toBe(true);
    expect(experience.features.priorityQueue).toBe(false);
  });

  it("adds Premium-only capabilities without changing the shared layout", () => {
    const experience = resolveTryOnExperience({
      authenticated: true,
      planCode: "premium",
    });

    expect(experience).toMatchObject({
      audience: "premium",
      planLabel: "Premium",
      showMemberGuidance: true,
      showHistoryPreview: true,
    });
    expect(experience.features).toMatchObject({
      hdDownload: true,
      priorityQueue: true,
      longTermHistory: true,
      fullLookLibrary: true,
    });
  });
});
