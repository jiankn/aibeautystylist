import { beforeEach, describe, expect, it } from "vitest";

import {
  consumeShareClaimIntent,
  createShareClaimIntent,
  resetMockShareIntents,
} from "./shareIntents";

const now = new Date("2026-06-07T00:00:00.000Z");

describe("share claim intents", () => {
  beforeEach(() => resetMockShareIntents());

  it("creates a short-lived claim token and consumes it once", async () => {
    const intent = await createShareClaimIntent({
      userId: "visitor_1",
      jobId: "job_1",
      method: "copy_link",
      now,
    });

    await expect(
      consumeShareClaimIntent({
        userId: "visitor_1",
        jobId: "job_1",
        claimToken: intent.claimToken,
        now,
      }),
    ).resolves.toEqual({ ok: true });

    await expect(
      consumeShareClaimIntent({
        userId: "visitor_1",
        jobId: "job_1",
        claimToken: intent.claimToken,
        now,
      }),
    ).resolves.toEqual({ ok: false, reason: "claimed" });
  });

  it("rejects expired or mismatched claim tokens", async () => {
    const intent = await createShareClaimIntent({
      userId: "visitor_1",
      jobId: "job_1",
      method: "web_share",
      now,
      ttlMs: 1000,
    });

    await expect(
      consumeShareClaimIntent({
        userId: "visitor_1",
        jobId: "job_2",
        claimToken: intent.claimToken,
        now,
      }),
    ).resolves.toEqual({ ok: false, reason: "missing" });

    await expect(
      consumeShareClaimIntent({
        userId: "visitor_1",
        jobId: "job_1",
        claimToken: intent.claimToken,
        now: new Date(now.getTime() + 1000),
      }),
    ).resolves.toEqual({ ok: false, reason: "expired" });
  });
});
