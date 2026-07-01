import { beforeEach, describe, expect, it } from "vitest";

import {
  getNextUtcMonthStart,
  getQuotaSnapshot,
  getUtcMonthStart,
  grantCreditPack,
  grantShareReward,
  refundQuota,
  reserveQuota,
  resolveQuotaPeriod,
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

  it("reserves and refunds multiple credits for one task", async () => {
    const reserved = await reserveQuota(
      "multi_credit_user",
      "job_multi",
      "request_multi",
      undefined,
      now,
      3,
      undefined,
      2,
    );
    expect(reserved).toMatchObject({
      reserved: true,
      snapshot: { remaining: 1 },
    });

    const insufficient = await reserveQuota(
      "multi_credit_user",
      "job_insufficient",
      "request_insufficient",
      undefined,
      now,
      3,
      undefined,
      2,
    );
    expect(insufficient).toMatchObject({
      reserved: false,
      duplicate: false,
      snapshot: { remaining: 1 },
    });

    await refundQuota("multi_credit_user", "job_multi", undefined, now, 3);
    const refundedAgain = await refundQuota(
      "multi_credit_user",
      "job_multi",
      undefined,
      now,
      3,
    );
    expect(refundedAgain.remaining).toBe(3);
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

  it("scopes paid usage to the subscription renewal period", async () => {
    const currentPeriod = {
      start: "2026-06-18T00:00:00.000Z",
      end: "2026-07-18T00:00:00.000Z",
    };
    await reserveQuota(
      "subscriber_1",
      "job_1",
      "request_1",
      undefined,
      new Date("2026-06-20T00:00:00.000Z"),
      70,
      currentPeriod,
    );

    await expect(
      getQuotaSnapshot(
        "subscriber_1",
        undefined,
        new Date("2026-07-01T00:00:00.000Z"),
        70,
        currentPeriod,
      ),
    ).resolves.toMatchObject({
      total: 70,
      remaining: 69,
      periodStart: "2026-06-18T00:00:00.000Z",
      nextRefreshAt: "2026-07-18T00:00:00.000Z",
    });

    await expect(
      getQuotaSnapshot(
        "subscriber_1",
        undefined,
        new Date("2026-07-18T00:00:00.000Z"),
        70,
        {
          start: "2026-07-18T00:00:00.000Z",
          end: "2026-08-18T00:00:00.000Z",
        },
      ),
    ).resolves.toMatchObject({
      total: 70,
      remaining: 70,
      periodStart: "2026-07-18T00:00:00.000Z",
      nextRefreshAt: "2026-08-18T00:00:00.000Z",
    });
  });

  it("credit pack credits persist across billing periods", async () => {
    const period1 = {
      start: "2026-06-01T00:00:00.000Z",
      end: "2026-07-01T00:00:00.000Z",
    };
    // 在周期1购买额度包
    await grantCreditPack({
      userId: "pack_user",
      checkoutSessionId: "cs_pack_1",
      credits: 20,
      now: new Date("2026-06-15T00:00:00.000Z"),
      monthlyQuota: 70,
      quotaPeriod: period1,
    });

    // 周期1结束前，额度包 20 + 月度 70 = 90
    await expect(
      getQuotaSnapshot(
        "pack_user",
        undefined,
        new Date("2026-06-20T00:00:00.000Z"),
        70,
        period1,
      ),
    ).resolves.toMatchObject({
      remaining: 90,
      packRemaining: 20,
    });

    // 进入周期2：月度额度重置为 70，额度包仍有 20
    const period2 = {
      start: "2026-07-01T00:00:00.000Z",
      end: "2026-08-01T00:00:00.000Z",
    };
    await expect(
      getQuotaSnapshot(
        "pack_user",
        undefined,
        new Date("2026-07-05T00:00:00.000Z"),
        70,
        period2,
      ),
    ).resolves.toMatchObject({
      remaining: 90,
      packRemaining: 20,
    });
  });

  it("consumes monthly credits before pack credits", async () => {
    // 月度额度 = 3（Free 用户），先购买额度包
    await grantCreditPack({
      userId: "order_user",
      checkoutSessionId: "cs_order_1",
      credits: 5,
      now,
      monthlyQuota: 3,
    });

    // 总额度 = 3 + 5 = 8
    const snap0 = await getQuotaSnapshot("order_user", undefined, now);
    expect(snap0.remaining).toBe(8);
    expect(snap0.packRemaining).toBe(5);

    // 消耗 1、2、3 次 → 应先消耗月度额度
    await reserveQuota("order_user", "j1", "r1", undefined, now);
    await reserveQuota("order_user", "j2", "r2", undefined, now);
    await reserveQuota("order_user", "j3", "r3", undefined, now);

    const snap3 = await getQuotaSnapshot("order_user", undefined, now);
    expect(snap3.remaining).toBe(5);
    expect(snap3.packRemaining).toBe(5); // 额度包未动

    // 消耗第 4 次 → 月度已耗尽，应消耗额度包
    await reserveQuota("order_user", "j4", "r4", undefined, now);

    const snap4 = await getQuotaSnapshot("order_user", undefined, now);
    expect(snap4.remaining).toBe(4);
    expect(snap4.packRemaining).toBe(4); // 额度包减 1
  });

  it("refunds pack credits back to the pack pool", async () => {
    await grantCreditPack({
      userId: "refund_user",
      checkoutSessionId: "cs_refund_1",
      credits: 5,
      now,
      monthlyQuota: 3,
    });

    // 用完月度 3 次
    await reserveQuota("refund_user", "j1", "r1", undefined, now);
    await reserveQuota("refund_user", "j2", "r2", undefined, now);
    await reserveQuota("refund_user", "j3", "r3", undefined, now);
    // 消耗 1 次额度包
    await reserveQuota("refund_user", "j4", "r4", undefined, now);

    const beforeRefund = await getQuotaSnapshot("refund_user", undefined, now);
    expect(beforeRefund.packRemaining).toBe(4);

    // 退还 j4（额度包消耗的那次）→ 应退回额度包
    await refundQuota("refund_user", "j4", undefined, now);

    const afterRefund = await getQuotaSnapshot("refund_user", undefined, now);
    expect(afterRefund.packRemaining).toBe(5);
    expect(afterRefund.remaining).toBe(5); // 月度仍为 0 + 额度包 5
  });

  it("splits a multi-credit reservation across monthly and pack balances", async () => {
    await grantCreditPack({
      userId: "mixed_reserve_user",
      checkoutSessionId: "cs_mixed",
      credits: 2,
      now,
      monthlyQuota: 3,
    });
    await reserveQuota(
      "mixed_reserve_user",
      "monthly_1",
      "monthly_request_1",
      undefined,
      now,
    );
    await reserveQuota(
      "mixed_reserve_user",
      "monthly_2",
      "monthly_request_2",
      undefined,
      now,
    );

    const reserved = await reserveQuota(
      "mixed_reserve_user",
      "mixed_job",
      "mixed_request",
      undefined,
      now,
      3,
      undefined,
      2,
    );
    expect(reserved.snapshot).toMatchObject({
      remaining: 1,
      packRemaining: 1,
    });

    const refunded = await refundQuota(
      "mixed_reserve_user",
      "mixed_job",
      undefined,
      now,
      3,
    );
    expect(refunded).toMatchObject({
      remaining: 3,
      packRemaining: 2,
    });
  });
});

describe("UTC quota periods", () => {
  it("calculates current and next month boundaries", () => {
    expect(getUtcMonthStart(now)).toBe("2026-06-01T00:00:00.000Z");
    expect(getNextUtcMonthStart(now)).toBe("2026-07-01T00:00:00.000Z");
  });

  it("infers a monthly subscription quota window from a renewal date", () => {
    expect(
      resolveQuotaPeriod(new Date("2026-07-20T00:00:00.000Z"), {
        end: "2026-07-18T00:00:00.000Z",
      }),
    ).toEqual({
      periodStart: "2026-07-18T00:00:00.000Z",
      nextRefreshAt: "2026-08-18T00:00:00.000Z",
    });
  });
});
