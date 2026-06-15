import { describe, expect, it } from "vitest";

import {
  computeSignature,
  verifyStripeWebhook,
  WebhookVerifyError,
} from "./stripeWebhook";

const secret = "whsec_test_secret";
const now = new Date("2026-06-07T00:00:00.000Z");

async function signedHeader(payload: string, timestamp: number) {
  const signature = await computeSignature(secret, `${timestamp}.${payload}`);
  return `t=${timestamp},v1=${signature}`;
}

describe("verifyStripeWebhook", () => {
  it("accepts a correctly signed payload", async () => {
    const payload = JSON.stringify({
      id: "evt_1",
      type: "customer.subscription.updated",
      data: { object: { id: "sub_1" } },
    });
    const timestamp = Math.floor(now.getTime() / 1000);
    const event = await verifyStripeWebhook({
      payload,
      signatureHeader: await signedHeader(payload, timestamp),
      secret,
      now,
    });
    expect(event).toMatchObject({ id: "evt_1" });
  });

  it("rejects a tampered payload", async () => {
    const payload = JSON.stringify({
      id: "evt_1",
      type: "x",
      data: { object: {} },
    });
    const timestamp = Math.floor(now.getTime() / 1000);
    const header = await signedHeader(payload, timestamp);
    await expect(
      verifyStripeWebhook({
        payload: payload + "tampered",
        signatureHeader: header,
        secret,
        now,
      }),
    ).rejects.toBeInstanceOf(WebhookVerifyError);
  });

  it("rejects an out-of-tolerance timestamp", async () => {
    const payload = JSON.stringify({
      id: "evt_1",
      type: "x",
      data: { object: {} },
    });
    const staleTimestamp = Math.floor(now.getTime() / 1000) - 10_000;
    await expect(
      verifyStripeWebhook({
        payload,
        signatureHeader: await signedHeader(payload, staleTimestamp),
        secret,
        now,
      }),
    ).rejects.toMatchObject({ code: "WEBHOOK_TIMESTAMP_INVALID" });
  });

  it("rejects a missing signature header", async () => {
    await expect(
      verifyStripeWebhook({
        payload: "{}",
        signatureHeader: null,
        secret,
        now,
      }),
    ).rejects.toMatchObject({ code: "WEBHOOK_SIGNATURE_INVALID" });
  });
});
