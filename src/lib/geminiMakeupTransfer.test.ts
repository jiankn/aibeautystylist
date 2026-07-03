import { describe, expect, it, vi } from "vitest";

import {
  analyzeMakeupReference,
  evaluateMakeupTransfer,
} from "./geminiMakeupTransfer";
import {
  MAKEUP_REFERENCE_SPEC_VERSION,
  MAKEUP_TRANSFER_QUALITY_VERSION,
  type MakeupReferenceSpec,
} from "./makeupTransfer";

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
                      baseCoverage: {
                        forehead: "medium",
                        temples: "medium",
                        nose: "medium",
                        cheeks: "medium",
                        chinJaw: "medium",
                        expectedContinuity: "full-face",
                      },
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

  it("treats a bare forehead as a blocking full-face base defect", async () => {
    const spec = fullFaceMakeupSpec();
    const fetcher = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        const request = JSON.parse(String(init?.body));
        const prompt = request.contents[0].parts[0].text;
        expect(prompt).toContain(
          "A made-up center face with a bare forehead is a blocking failure",
        );
        expect(prompt).toContain("Base coverage map: forehead=medium");
        return Response.json({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      schemaVersion: MAKEUP_TRANSFER_QUALITY_VERSION,
                      overallScore: 88,
                      makeupSimilarityScore: 91,
                      identityPreservationScore: 96,
                      baseCoverageContinuityScore: 58,
                      baseCoverageMissing: ["forehead"],
                      criticalMissing: [],
                      conflicts: ["forehead remains untreated"],
                      correctionInstructions: [
                        "continue foundation across the forehead",
                      ],
                    }),
                  },
                ],
              },
            },
          ],
        });
      },
    );
    const image = {
      data: new Uint8Array([1, 2]).buffer,
      mimeType: "image/webp",
    };

    const response = await evaluateMakeupTransfer({
      apiKey: "secret",
      model: "gemini-test",
      reference: image,
      selfie: image,
      result: image,
      spec,
      fetcher: fetcher as typeof fetch,
    });

    expect(response.result.baseCoverageMissing).toEqual(["forehead"]);
    expect(response.result.baseCoverageContinuityScore).toBe(58);
  });
});

function fullFaceMakeupSpec(): MakeupReferenceSpec {
  const area = {
    colors: ["neutral"],
    placement: ["full face"],
    finish: ["luminous"],
    intensity: "medium" as const,
  };
  return {
    schemaVersion: MAKEUP_REFERENCE_SPEC_VERSION,
    summary: "Continuous luminous base",
    focalAreas: ["base"],
    base: area,
    baseCoverage: {
      forehead: "medium",
      temples: "medium",
      nose: "medium",
      cheeks: "medium",
      chinJaw: "medium",
      expectedContinuity: "full-face",
    },
    eyes: area,
    brows: area,
    cheeks: area,
    lips: area,
    contourHighlight: area,
    mustMatch: ["continuous luminous base"],
    mustAvoid: ["bare forehead"],
  };
}
