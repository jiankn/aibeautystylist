import { describe, expect, it } from "vitest";

import {
  isPinterestGuestTryonParams,
  pinterestGuestPassState,
  type PinterestGuestPass,
} from "./pinterestGuestPass";

function makePass(
  override: Partial<PinterestGuestPass> = {},
): PinterestGuestPass {
  return {
    id: "pguest_test",
    tokenHash: "hash",
    guestUserId: "guest_pguest_test",
    createdAt: "2026-07-07T00:00:00.000Z",
    expiresAt: "2026-08-06T00:00:00.000Z",
    ...override,
  };
}

describe("pinterestGuestPass", () => {
  it("requires the explicit Pinterest guest try-on flag", () => {
    expect(
      isPinterestGuestTryonParams(
        new URLSearchParams(
          "guest_try=1&utm_source=pinterest&utm_content=pin_soft_glam_01",
        ),
      ),
    ).toBe(true);
    expect(
      isPinterestGuestTryonParams(
        new URLSearchParams(
          "guest_try=1&source=pinterest_wedding_guest&utm_content=pin_wedding_guest_01",
        ),
      ),
    ).toBe(true);
    expect(
      isPinterestGuestTryonParams(new URLSearchParams("utm_source=pinterest")),
    ).toBe(false);
    expect(
      isPinterestGuestTryonParams(
        new URLSearchParams("guest_try=1&utm_source=google"),
      ),
    ).toBe(false);
  });

  it("marks a pass unavailable after it is used, assigned to a job, or expired", () => {
    const now = new Date("2026-07-08T00:00:00.000Z");

    expect(pinterestGuestPassState(makePass(), now)).toMatchObject({
      available: true,
      used: false,
      remaining: 1,
    });
    expect(
      pinterestGuestPassState(makePass({ usedAt: now.toISOString() }), now),
    ).toMatchObject({ available: false, used: true, remaining: 0 });
    expect(
      pinterestGuestPassState(makePass({ jobId: "job_1" }), now),
    ).toMatchObject({ available: false, used: true, remaining: 0 });
    expect(
      pinterestGuestPassState(
        makePass({ expiresAt: "2026-07-07T23:59:59.000Z" }),
        now,
      ),
    ).toMatchObject({ available: false, used: true, remaining: 0 });
  });
});
