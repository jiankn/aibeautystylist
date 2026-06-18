import { beforeEach, describe, expect, it, vi } from "vitest";

import { lookCatalog } from "../data/lookCatalog";
import type { RuntimeBindings } from "./runtime";
import {
  enqueueTryOnJob,
  processTryOnJobQueueMessage,
  type TryOnJobQueueMessage,
} from "./tryonQueue";
import { processTryOnJob } from "./tryonJobService";

vi.mock("./tryonJobService", () => ({
  processTryOnJob: vi.fn(),
}));

const look = lookCatalog[0]!;

describe("try-on queue", () => {
  beforeEach(() => {
    vi.mocked(processTryOnJob).mockReset();
  });

  it("returns false when the queue binding is not configured", async () => {
    await expect(
      enqueueTryOnJob({
        userId: "user_1",
        jobId: "job_1",
        look,
        bindings: {},
        locale: "zh-CN",
      }),
    ).resolves.toBe(false);
  });

  it("sends a small job message to Cloudflare Queues", async () => {
    const send = vi.fn(async () => undefined);
    const bindings = {
      TRYON_JOBS_QUEUE: { send },
    } as unknown as RuntimeBindings;

    await expect(
      enqueueTryOnJob({
        userId: "user_1",
        jobId: "job_1",
        look,
        bindings,
        locale: "ja-JP",
      }),
    ).resolves.toBe(true);

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        version: 1,
        userId: "user_1",
        jobId: "job_1",
        look,
        locale: "ja-JP",
        enqueuedAt: expect.any(String),
      }),
    );
    expect(processTryOnJob).not.toHaveBeenCalled();
  });

  it("processes valid queue messages through the job service", async () => {
    const message: TryOnJobQueueMessage = {
      version: 1,
      userId: "user_1",
      jobId: "job_1",
      look,
      locale: "pt-BR",
      enqueuedAt: new Date().toISOString(),
    };
    const bindings = {} as RuntimeBindings;

    await processTryOnJobQueueMessage(message, bindings);

    expect(processTryOnJob).toHaveBeenCalledWith({
      userId: "user_1",
      jobId: "job_1",
      look,
      bindings,
      audienceContext: { locale: "pt-BR" },
    });
  });

  it("rejects malformed queue messages so Cloudflare can retry or DLQ them", async () => {
    await expect(processTryOnJobQueueMessage({}, {})).rejects.toThrow(
      "INVALID_TRYON_QUEUE_MESSAGE",
    );
  });
});
