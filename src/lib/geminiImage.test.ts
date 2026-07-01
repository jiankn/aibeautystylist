import { describe, expect, it, vi } from "vitest";

import { generateGeminiMakeupImage } from "./geminiImage";

describe("generateGeminiMakeupImage", () => {
  it("places an explicit role label next to each private-transfer image", async () => {
    const fetcher = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        const request = JSON.parse(String(init?.body));
        expect(request.contents[0].parts).toEqual([
          { text: "Transfer the labeled makeup reference." },
          { text: "MAKEUP REFERENCE — cosmetics only" },
          {
            inlineData: {
              mimeType: "image/webp",
              data: "AQI=",
            },
          },
          { text: "SELFIE — identity and scene only" },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: "AwQ=",
            },
          },
          {
            text: "Generate the final edited selfie now, following the labeled image roles and all makeup-fidelity requirements above.",
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
      prompt: "Transfer the labeled makeup reference.",
      labeledImages: [
        {
          label: "MAKEUP REFERENCE — cosmetics only",
          data: new Uint8Array([1, 2]).buffer,
          mimeType: "image/webp",
        },
        {
          label: "SELFIE — identity and scene only",
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
