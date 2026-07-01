import { describe, expect, it, vi } from "vitest";

import { analyzeMakeupReference } from "./geminiMakeupTransfer";
import { MAKEUP_REFERENCE_SPEC_VERSION } from "./makeupTransfer";

describe("Gemini makeup-reference analysis", () => {
  it("labels the reference image and requests schema-bound JSON", async () => {
    const fetcher = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        const request = JSON.parse(String(init?.body));
        expect(request.contents[0].parts[1]).toEqual({
          text: "MAKEUP REFERENCE IMAGE — analyze this image only:",
        });
        expect(request.contents[0].parts[2]).toEqual({
          inlineData: { mimeType: "image/webp", data: "AQI=" },
        });
        expect(request.generationConfig.responseMimeType).toBe(
          "application/json",
        );
        expect(request.generationConfig.responseJsonSchema).toBeTruthy();

        const area = {
          colors: ["silver"],
          placement: ["mobile lid"],
          finish: ["wet-look"],
          intensity: "strong",
        };
        return Response.json({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      schemaVersion: MAKEUP_REFERENCE_SPEC_VERSION,
                      summary: "Reflective silver lid",
                      focalAreas: ["eyes"],
                      base: area,
                      eyes: area,
                      brows: area,
                      cheeks: area,
                      lips: area,
                      contourHighlight: area,
                      mustMatch: ["reflective lid"],
                      mustAvoid: ["matte brown shadow"],
                    }),
                  },
                ],
              },
            },
          ],
        });
      },
    );

    const response = await analyzeMakeupReference({
      apiKey: "secret",
      model: "gemini-test",
      reference: {
        data: new Uint8Array([1, 2]).buffer,
        mimeType: "image/webp",
      },
      fetcher: fetcher as typeof fetch,
    });

    expect(response.result.summary).toBe("Reflective silver lid");
  });
});
