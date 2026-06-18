import { describe, expect, it, vi } from "vitest";

import {
  DIAGNOSIS_DISCLAIMER,
  parseDiagnosisResult,
  type DiagnosisResult,
} from "./diagnosis";
import {
  DiagnosisProviderError,
  generateGeminiDiagnosis,
} from "./geminiDiagnosis";

describe("diagnosis schema", () => {
  it("parses a fixed diagnosis schema and appends the product disclaimer", () => {
    expect(parseDiagnosisResult(validDiagnosis())).toMatchObject({
      schemaVersion: "2026-06-07",
      confidence: { overall: 0.82, band: "high" },
      disclaimer: DIAGNOSIS_DISCLAIMER,
    });
  });

  it("rejects semantically inconsistent confidence bands", () => {
    const invalid = validDiagnosis();
    invalid.confidence.band = "high";
    invalid.confidence.overall = 0.4;
    expect(() => parseDiagnosisResult(invalid)).toThrow(
      "INVALID_DIAGNOSIS_SCHEMA:confidence.band",
    );
  });
});

describe("Gemini diagnosis provider", () => {
  it("sends inline image structured-output requests and validates the result", async () => {
    const fetcher = vi.fn(async (_url: string, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body));
      expect(init?.headers).toMatchObject({ "x-goog-api-key": "secret" });
      expect(request.contents[0].parts[0].text).toContain(
        'The active UI locale is "ja-JP"',
      );
      expect(request.contents[0].parts[0].text).toContain(
        "Write every user-visible free-text field in Japanese",
      );
      expect(request.contents[0].parts[0].text).toContain(
        "Keep schema enum values exactly as defined in English",
      );
      expect(request.contents[0].parts[1].inlineData).toEqual({
        mimeType: "image/jpeg",
        data: "AQID",
      });
      expect(request.generationConfig).toMatchObject({
        responseMimeType: "application/json",
        responseJsonSchema: expect.any(Object),
      });
      return Response.json({
        candidates: [
          { content: { parts: [{ text: JSON.stringify(validDiagnosis()) }] } },
        ],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 20,
          totalTokenCount: 30,
        },
      });
    });

    await expect(
      generateGeminiDiagnosis({
        apiKey: "secret",
        model: "gemini-2.5-flash",
        photo: {
          data: new Uint8Array([1, 2, 3]).buffer,
          mimeType: "image/jpeg",
        },
        locale: "ja-JP",
        fetcher: fetcher as typeof fetch,
      }),
    ).resolves.toMatchObject({
      model: "gemini-2.5-flash",
      usage: { promptTokens: 10, outputTokens: 20, totalTokens: 30 },
      result: { disclaimer: DIAGNOSIS_DISCLAIMER },
    });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("classifies blocked and invalid provider responses", async () => {
    const blocked = vi.fn(async () =>
      Response.json({ promptFeedback: { blockReason: "SAFETY" } }),
    );
    const invalid = vi.fn(async () =>
      Response.json({
        candidates: [{ content: { parts: [{ text: "{}" }] } }],
      }),
    );

    await expect(providerCall(blocked)).rejects.toMatchObject({
      code: "GEMINI_BLOCKED",
    });
    await expect(providerCall(invalid)).rejects.toMatchObject({
      code: "GEMINI_INVALID_RESPONSE",
    });
  });

  it("requires provider configuration before making a request", async () => {
    await expect(
      generateGeminiDiagnosis({
        apiKey: "",
        model: "",
        photo: { data: new ArrayBuffer(0), mimeType: "image/png" },
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<DiagnosisProviderError>>({
        code: "GEMINI_UNAVAILABLE",
      }),
    );
  });
});

function providerCall(fetcher: ReturnType<typeof vi.fn>) {
  return generateGeminiDiagnosis({
    apiKey: "secret",
    model: "gemini-2.5-flash",
    photo: { data: new Uint8Array([1]).buffer, mimeType: "image/jpeg" },
    fetcher: fetcher as typeof fetch,
  });
}

function validDiagnosis(): Omit<
  DiagnosisResult,
  "schemaVersion" | "disclaimer"
> {
  return {
    confidence: {
      overall: 0.82,
      band: "high",
      limitations: ["室内光线可能影响肤色判断"],
    },
    skinTone: {
      depth: "light",
      undertone: "neutral",
      summary: "明度较高的中性肤色表现",
    },
    faceShape: {
      primary: "oval",
      evidence: ["面部长度略大于宽度"],
    },
    eyeShape: {
      primary: "almond",
      evidence: ["眼裂横向比例较明显"],
    },
    colorSeason: {
      season: "soft-summer",
      rationale: "低饱和冷中性色更协调",
    },
    strengths: ["适合柔和层次", "适合低饱和配色"],
    cautions: ["避免绝对化色号判断"],
    makeupDirections: [
      {
        title: "柔雾通勤",
        rationale: "保持低对比度",
        palette: ["灰粉", "柔棕"],
      },
      {
        title: "清透约会",
        rationale: "提升自然气色",
        palette: ["玫瑰粉", "奶咖"],
      },
      {
        title: "冷调上镜",
        rationale: "增加适度轮廓",
        palette: ["梅子色", "灰棕"],
      },
    ],
  };
}
