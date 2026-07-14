import { describe, expect, it, vi } from "vitest";

import {
  analyzeEvolinkMakeupReference,
  EvolinkVisionError,
} from "./evolinkVision";
import { MAKEUP_REFERENCE_SPEC_VERSION } from "./makeupTransfer";

describe("EvoLink vision provider", () => {
  it("sends a multimodal JSON Schema request through the OpenAI-compatible endpoint", async () => {
    const result = validReferenceSpec();
    const fetcher = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        expect(String(input)).toBe(
          "https://api.evolink.ai/v1/chat/completions",
        );
        expect(init?.headers).toMatchObject({
          Authorization: "Bearer secret",
          "content-type": "application/json",
        });
        const body = JSON.parse(String(init?.body));
        expect(body).toMatchObject({
          model: "doubao-seed-2.0-lite",
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "makeup_reference_spec",
              strict: true,
            },
          },
        });
        expect(body.messages[0].content).toEqual([
          expect.objectContaining({ type: "text" }),
          {
            type: "image_url",
            image_url: {
              url: "data:image/webp;base64,AQID",
            },
          },
        ]);
        return Response.json({
          model: "doubao-seed-2.0-lite",
          choices: [
            {
              message: { content: JSON.stringify(result) },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: 12,
            completion_tokens: 34,
            total_tokens: 46,
          },
        });
      },
    );

    await expect(
      analyzeEvolinkMakeupReference({
        apiKey: "secret",
        model: "doubao-seed-2.0-lite",
        reference: {
          data: new Uint8Array([1, 2, 3]).buffer,
          mimeType: "image/webp",
        },
        fetcher: fetcher as typeof fetch,
      }),
    ).resolves.toMatchObject({
      result,
      model: "doubao-seed-2.0-lite",
      usage: { promptTokens: 12, outputTokens: 34, totalTokens: 46 },
    });
  });

  it("classifies malformed structured output", async () => {
    const fetcher = vi.fn(async () =>
      Response.json({
        choices: [{ message: { content: "not-json" }, finish_reason: "stop" }],
      }),
    );

    await expect(
      analyzeEvolinkMakeupReference({
        apiKey: "secret",
        model: "doubao-seed-2.0-lite",
        reference: { data: new ArrayBuffer(1), mimeType: "image/jpeg" },
        fetcher: fetcher as typeof fetch,
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<EvolinkVisionError>>({
        code: "MAKEUP_REFERENCE_ANALYSIS_INVALID",
      }),
    );
  });
});

function validReferenceSpec() {
  const area = {
    colors: ["rose"],
    placement: ["centered"],
    finish: ["satin"],
    intensity: "medium" as const,
  };
  return {
    schemaVersion: MAKEUP_REFERENCE_SPEC_VERSION,
    summary: "A rose satin makeup look",
    focalAreas: ["eyes", "lips"],
    base: area,
    baseCoverage: {
      forehead: "medium" as const,
      temples: "medium" as const,
      nose: "medium" as const,
      cheeks: "medium" as const,
      chinJaw: "medium" as const,
      expectedContinuity: "full-face" as const,
    },
    eyes: area,
    brows: area,
    cheeks: area,
    lips: area,
    contourHighlight: area,
    mustMatch: ["rose satin eyes"],
    mustAvoid: ["orange lips"],
  };
}
