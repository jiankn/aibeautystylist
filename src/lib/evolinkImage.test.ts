import { describe, expect, it, vi } from "vitest";

import { EvolinkImageError, generateEvolinkMakeupImage } from "./evolinkImage";

describe("Evolink image provider", () => {
  it("uploads the source photo, creates an image edit task, polls, and downloads the result", async () => {
    const fetcher = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith("/api/v1/files/upload/stream")) {
          expect(init?.headers).toMatchObject({
            Authorization: "Bearer secret",
          });
          expect(init?.body).toBeInstanceOf(FormData);
          return Response.json({
            success: true,
            data: {
              file_url: "https://files.evolink.ai/aibeautystylist/selfie.jpg",
            },
          });
        }
        if (url.endsWith("/v1/images/generations")) {
          const body = JSON.parse(String(init?.body));
          expect(body).toMatchObject({
            model: "wan2.5-image-to-image",
            prompt: "apply a soft peach makeup look",
            image_urls: ["https://files.evolink.ai/aibeautystylist/selfie.jpg"],
            size: "1280x1280",
            n: 1,
          });
          expect(body).not.toHaveProperty("quality");
          return Response.json({
            id: "task_1",
            model: "wan2.5-image-to-image",
            status: "pending",
            usage: { estimated_cost: 0.12 },
          });
        }
        if (url.endsWith("/v1/tasks/task_1")) {
          return Response.json({
            id: "task_1",
            model: "wan2.5-image-to-image",
            status: "completed",
            results: ["https://cdn.evolink.ai/result.png"],
            usage: { estimated_cost: 0.14 },
          });
        }
        if (url === "https://cdn.evolink.ai/result.png") {
          return new Response(new Uint8Array([1, 2, 3]), {
            headers: { "content-type": "image/png" },
          });
        }
        throw new Error(`unexpected request: ${url}`);
      },
    );

    await expect(
      generateEvolinkMakeupImage({
        apiKey: "secret",
        model: "wan2.5-image-to-image",
        prompt: "apply a soft peach makeup look",
        photo: {
          data: new Uint8Array([9, 8, 7]).buffer,
          mimeType: "image/jpeg",
        },
        fetcher: fetcher as typeof fetch,
      }),
    ).resolves.toMatchObject({
      taskId: "task_1",
      model: "wan2.5-image-to-image",
      estimatedCostMicros: 140_000,
      image: {
        contentType: "image/png",
        sourceUrl: "https://cdn.evolink.ai/result.png",
      },
    });
    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it("classifies failed tasks", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/v1/files/upload/stream")) {
        return Response.json({
          success: true,
          data: { file_url: "https://files.evolink.ai/selfie.jpg" },
        });
      }
      if (url.endsWith("/v1/images/generations")) {
        return Response.json({ id: "task_1", status: "pending" });
      }
      return Response.json({
        id: "task_1",
        status: "failed",
        error: { code: "content_policy_violation" },
      });
    });

    await expect(
      generateEvolinkMakeupImage({
        apiKey: "secret",
        prompt: "apply makeup",
        photo: { data: new ArrayBuffer(1), mimeType: "image/jpeg" },
        fetcher: fetcher as typeof fetch,
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<EvolinkImageError>>({
        code: "EVOLINK_TASK_FAILED",
      }),
    );
  });

  it("requires an API key", async () => {
    await expect(
      generateEvolinkMakeupImage({
        apiKey: "",
        prompt: "apply makeup",
        photo: { data: new ArrayBuffer(1), mimeType: "image/png" },
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<EvolinkImageError>>({
        code: "EVOLINK_UNAVAILABLE",
      }),
    );
  });
});
