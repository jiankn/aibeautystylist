import { describe, expect, it } from "vitest";

import { normalizeAnalyticsEvent } from "./analyticsEvents";

describe("normalizeAnalyticsEvent", () => {
  it("keeps bounded Pinterest attribution and event properties", () => {
    const event = normalizeAnalyticsEvent(
      {
        event: "tryon_job_created",
        visitorId: "c958ef02-7308-44e2-b26c-188e1d0dbe00",
        properties: {
          path: "/tryon",
          source: "pinterest",
          medium: "organic_social",
          campaign: "launch",
          content: "ai_makeup_tryon_01",
          referrerHost: "www.pinterest.com",
          durationMs: 1280,
          successful: true,
        },
      },
      new Date("2026-07-05T12:34:56.000Z"),
    );

    expect(event).toMatchObject({
      eventName: "tryon_job_created",
      day: "2026-07-05",
      visitorKey: "c958ef02-7308-44e2-b26c-188e1d0dbe00",
      path: "/tryon",
      source: "pinterest",
      medium: "organic_social",
      campaign: "launch",
      content: "ai_makeup_tryon_01",
      referrerHost: "www.pinterest.com",
    });
    expect(event?.properties.durationMs).toBe(1280);
    expect(event?.properties.successful).toBe(true);
  });

  it("rejects invalid event names", () => {
    expect(normalizeAnalyticsEvent({ event: "Page View!" })).toBeNull();
    expect(normalizeAnalyticsEvent({ event: "" })).toBeNull();
  });

  it("drops nested data, invalid paths and invalid visitor identifiers", () => {
    const event = normalizeAnalyticsEvent({
      event: "page_view",
      visitorId: "short",
      properties: {
        path: "https://example.com/private",
        nested: { email: "not-stored@example.com" },
        email: null,
      },
    });

    expect(event?.visitorKey).toBeNull();
    expect(event?.path).toBeNull();
    expect(event?.properties).not.toHaveProperty("nested");
    expect(event?.properties).not.toHaveProperty("email");
  });
});
