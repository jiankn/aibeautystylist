import { describe, expect, it, vi } from "vitest";

import { generateGeminiMakeupImage } from "./geminiImage";

describe("generateGeminiMakeupImage", () => {
  it("keeps multiple input images in the declared reference/selfie order", async () => {
    const fetcher = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        const request = JSON.parse(String(init?.body));
        expect(request.contents[0].parts).toEqual([
          { text: "Image 1 is reference. Image 2 is selfie." },
          {
            inlineData: {
              mimeType: "image/webp",
              data: "AQI=",
            },
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: "AwQ=",
            },
          },
        ]);

        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      inlineData: {
                        mimeType: "image/png",
                        data: "BQY=",
                      },
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      },
    );

    const result = await generateGeminiMakeupImage({
      apiKey: "test-key",
      model: "test-model",
      prompt: "Image 1 is reference. Image 2 is selfie.",
      images: [
        {
          data: new Uint8Array([1, 2]).buffer,
          mimeType: "image/webp",
        },
        {
          data: new Uint8Array([3, 4]).buffer,
          mimeType: "image/jpeg",
        },
      ],
      fetcher: fetcher as typeof fetch,
    });

    expect(fetcher).toHaveBeenCalledOnce();
    expect([...new Uint8Array(result.image.data)]).toEqual([5, 6]);
    expect(result.image.contentType).toBe("image/png");
  });
});
