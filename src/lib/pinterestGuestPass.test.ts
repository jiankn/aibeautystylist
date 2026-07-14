import { describe, expect, it } from "vitest";

import {
  getPinterestGuestAllowance,
  getPinterestGuestGenerationLimits,
  isCampaignGuestTryonParams,
  isPinterestGuestTryonParams,
  isSameOriginGuestPassRequest,
  normalizePinterestGuestDeviceId,
  pinterestGuestPassState,
  reservePinterestGuestGeneration,
  type PinterestGuestPass,
} from "./pinterestGuestPass";
import type { D1DatabaseLike, D1StatementLike } from "./runtime";

interface AllowanceRow {
  device_count: number;
  ip_count: number;
  daily_count: number;
}

class StubStatement implements D1StatementLike {
  bindings: unknown[] = [];

  constructor(
    private readonly row: AllowanceRow | null,
    private readonly changes: number,
  ) {}

  bind(...values: unknown[]): D1StatementLike {
    this.bindings = values;
    return this;
  }

  async first<T>(): Promise<T | null> {
    return this.row as T | null;
  }

  async all<T>(): Promise<{ results?: T[] }> {
    return { results: [] };
  }

  async run(): Promise<unknown> {
    return { meta: { changes: this.changes } };
  }
}

class StubDatabase implements D1DatabaseLike {
  lastQuery = "";
  lastStatement?: StubStatement;

  constructor(
    private readonly row: AllowanceRow | null,
    private readonly changes = 1,
  ) {}

  prepare(query: string): D1StatementLike {
    this.lastQuery = query;
    this.lastStatement = new StubStatement(this.row, this.changes);
    return this.lastStatement;
  }
}

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

  it("also allows Google Images campaign traffic to use the one guest preview", () => {
    expect(
      isCampaignGuestTryonParams(
        new URLSearchParams(
          "guest_try=1&utm_source=google_images&utm_content=google_image_glass_skin_01",
        ),
      ),
    ).toBe(true);
    expect(
      isCampaignGuestTryonParams(
        new URLSearchParams("guest_try=1&source=google_images_passport_photo"),
      ),
    ).toBe(true);
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

  it("accepts only same-origin browser requests for guest-pass issuance", () => {
    expect(
      isSameOriginGuestPassRequest(
        new Request("https://aibeautystylist.com/api/pinterest-guest-pass", {
          method: "POST",
          headers: {
            origin: "https://aibeautystylist.com",
            referer:
              "https://aibeautystylist.com/tryon?guest_try=1&utm_source=pinterest",
            "sec-fetch-site": "same-origin",
          },
        }),
      ),
    ).toBe(true);
    expect(
      isSameOriginGuestPassRequest(
        new Request("https://aibeautystylist.com/api/pinterest-guest-pass", {
          method: "POST",
          headers: { origin: "https://example.com" },
        }),
      ),
    ).toBe(false);
    expect(
      isSameOriginGuestPassRequest(
        new Request("https://aibeautystylist.com/api/pinterest-guest-pass", {
          method: "POST",
        }),
      ),
    ).toBe(false);
  });

  it("normalizes the privacy-preserving browser device identifier", () => {
    expect(
      normalizePinterestGuestDeviceId("9b1cf4f1-7e09-45d8-a6de-8724e3de027d"),
    ).toBe("9b1cf4f1-7e09-45d8-a6de-8724e3de027d");
    expect(normalizePinterestGuestDeviceId("short")).toBeUndefined();
    expect(
      normalizePinterestGuestDeviceId("bad value with spaces"),
    ).toBeUndefined();
  });

  it("uses configurable IP and global anonymous generation limits", () => {
    expect(getPinterestGuestGenerationLimits("4", "250")).toEqual({
      maxPerIp: 4,
      maxDaily: 250,
    });
    expect(getPinterestGuestGenerationLimits("0", "0")).toEqual({
      maxPerIp: 0,
      maxDaily: 0,
    });
    expect(getPinterestGuestGenerationLimits("invalid", "-1")).toEqual({
      maxPerIp: 3,
      maxDaily: 100,
    });
  });

  it.each([
    [{ device_count: 1, ip_count: 0, daily_count: 0 }, "device"],
    [{ device_count: 0, ip_count: 3, daily_count: 3 }, "ip"],
    [{ device_count: 0, ip_count: 0, daily_count: 100 }, "budget"],
  ] as const)("blocks guest generation for %s", async (row, reason) => {
    const allowance = await getPinterestGuestAllowance({
      DB: new StubDatabase(row),
      clientKeyHash: "ip_hash",
      deviceKeyHash: "device_hash",
      limits: { maxPerIp: 3, maxDaily: 100 },
      now: new Date("2026-07-14T00:00:00.000Z"),
    });

    expect(allowance).toMatchObject({ allowed: false, reason });
  });

  it("allows a low-risk first anonymous generation", async () => {
    const allowance = await getPinterestGuestAllowance({
      DB: new StubDatabase({
        device_count: 0,
        ip_count: 0,
        daily_count: 0,
      }),
      clientKeyHash: "ip_hash",
      deviceKeyHash: "device_hash",
      limits: { maxPerIp: 3, maxDaily: 100 },
    });

    expect(allowance.allowed).toBe(true);
  });

  it("reserves the entitlement with all abuse checks in one update", async () => {
    const DB = new StubDatabase(null);
    const reserved = await reservePinterestGuestGeneration(
      makePass({
        uploadId: "upload_1",
        clientKeyHash: "ip_hash",
        deviceKeyHash: "device_hash",
      }),
      "upload_1",
      DB,
      {
        limits: { maxPerIp: 3, maxDaily: 100 },
        now: new Date("2026-07-14T00:00:00.000Z"),
      },
    );

    expect(reserved).toBe(true);
    expect(DB.lastQuery).toContain("NOT EXISTS");
    expect(DB.lastQuery).toContain("SELECT COUNT(*)");
    expect(DB.lastStatement?.bindings).toContain("device_hash");
    expect(DB.lastStatement?.bindings).toContain("ip_hash");
  });
});
