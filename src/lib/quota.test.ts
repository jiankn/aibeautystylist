import { beforeEach, describe, expect, it } from "vitest";

import {
  getNextUtcMonthStart,
  getQuotaSnapshot,
  getUtcMonthStart,
  grantShareReward,
  refundQuota,
  reserveQuota,
  resetQuotaForPlanUpgrade,
  resetMockQuota,
} from "./quota";

const now = new Date("2026-06-07T00:00:00.000Z");

describe("quota ledger", () => {
  beforeEach(() => resetMockQuota());

  it("starts Free users with three monthly uses", async () => {
    await expect(
      getQuotaSnapshot("visitor_1", undefined, now),
    ).resolves.toMatchObject({
      remaining: 3,
      total: 3,
      used: 0,
      nextRefreshAt: "2026-07-01T00:00:00.000Z",
    });
  });

  it("reserves once for the same idempotency key", async () => {
    const first = await reserveQuota(
      "visitor_1",
      "job_1",
      "request_1",
      undefined,
      now,
    );
    const duplicate = await reserveQuota(
      "visitor_1",
      "job_1",
      "request_1",
      undefined,
      now,
    );

    expect(first).toMatchObject({ reserved: true, duplicate: false });
    expect(duplicate).toMatchObject({
      reserved: false,
      duplicate: true,
      snapshot: { remaining: 2 },
    });
  });

  it("blocks the fourth task and refunds a failed task once", async () => {
    await reserveQuota("visitor_1", "job_1", "request_1", undefined, now);
    await reserveQuota("visitor_1", "job_2", "request_2", undefined, now);
    await reserveQuota("visitor_1", "job_3", "request_3", undefined, now);
    const exhausted = await reserveQuota(
      "visitor_1",
      "job_4",
      "request_4",
      undefined,
      now,
    );

    expect(exhausted).toMatchObject({
      reserved: false,
      duplicate: false,
      snapshot: { remaining: 0 },
    });

    await refundQuota("visitor_1", "job_3", undefined, now);
    const refundedAgain = await refundQuota(
      "visitor_1",
      "job_3",
      undefined,
      now,
    );
    expect(refundedAgain.remaining).toBe(1);
  });

  it("grants one share reward per UTC day", async () => {
    const first = await grantShareReward("visitor_1", "job_1", undefined, now);
    const duplicate = await grantShareReward(
      "visitor_1",
      "job_1",
      undefined,
      now,
    );

    expect(first).toMatchObject({
      rewarded: true,
      duplicate: false,
      snapshot: { remaining: 4 },
    });
    expect(duplicate).toMatchObject({
      rewarded: false,
      duplicate: true,
      snapshot: { remaining: 4 },
    });
  });

  it("tops up quota once when a user upgrades plans", async () => {
    await reserveQuota("visitor_1", "job_1", "request_1", undefined, now);
    await reserveQuota("visitor_1", "job_2", "request_2", undefined, now);
    await reserveQuota("visitor_1", "job_3", "request_3", undefined, now);

    const reset = await resetQuotaForPlanUpgrade({
      userId: "visitor_1",
      fromPlanCode: "free",
      toPlanCode: "pro",
      sourceId: "sub_1",
      now,
    });
    expect(reset).toMatchObject({
      reset: true,
      duplicate: false,
      amount: 3,
      snapshot: { total: 70, remaining: 70 },
    });

    await reserveQuota(
      "visitor_1",
      "job_pro",
      "request_pro",
      undefined,
      now,
      70,
    );
    const duplicate = await resetQuotaForPlanUpgrade({
      userId: "visitor_1",
      fromPlanCode: "free",
      toPlanCode: "pro",
      sourceId: "sub_1",
      now,
    });
    expect(duplicate).toMatchObject({
      reset: false,
      duplicate: true,
      amount: 0,
      snapshot: { total: 70, remaining: 69 },
    });
  });
});

describe("UTC quota periods", () => {
  it("calculates current and next month boundaries", () => {
    expect(getUtcMonthStart(now)).toBe("2026-06-01T00:00:00.000Z");
    expect(getNextUtcMonthStart(now)).toBe("2026-07-01T00:00:00.000Z");
  });
});
