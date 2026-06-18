import { beforeEach, describe, expect, it, vi } from "vitest";

import { lookCatalog } from "../data/lookCatalog";
import type { AudienceContext } from "../data/makeup/audienceTypes";
import { getMockAiCallLogs, resetMockAiCallLogs } from "./aiCallLogs";
import { type DiagnosisResult } from "./diagnosis";
import {
  getDiagnosisRecordByJobId,
  resetMockDiagnosisRecords,
} from "./diagnosisRecords";
import { EvolinkImageError, generateEvolinkMakeupImage } from "./evolinkImage";
import {
  DiagnosisProviderError,
  generateGeminiDiagnosis,
} from "./geminiDiagnosis";
import { GeminiImageError, generateGeminiMakeupImage } from "./geminiImage";
import { getStoredJobById, resetMockJobs } from "./jobs";
import { getQuotaSnapshot, resetMockQuota } from "./quota";
import type { RuntimeBindings } from "./runtime";
import {
  createTryOnJob,
  processTryOnJob,
  TryOnJobServiceError,
} from "./tryonJobService";
import { resetMockUploads, saveUploadRecord } from "./uploadRecords";

vi.mock("./geminiDiagnosis", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./geminiDiagnosis")>();
  return {
    ...actual,
    generateGeminiDiagnosis: vi.fn(),
  };
});

vi.mock("./evolinkImage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./evolinkImage")>();
  return {
    ...actual,
    generateEvolinkMakeupImage: vi.fn(),
  };
});

vi.mock("./geminiImage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./geminiImage")>();
  return {
    ...actual,
    generateGeminiMakeupImage: vi.fn(),
  };
});

const look = lookCatalog.find((item) => item.slug === "commute")!;
const jaAudienceContext: AudienceContext = {
  locale: "ja-JP",
  marketProfile: "east-asia",
  beautyPreferences: [],
  representationPreference: ["east-asian"],
  source: "locale",
};

describe("createTryOnJob", () => {
  beforeEach(() => {
    resetMockAiCallLogs();
    resetMockDiagnosisRecords();
    resetMockJobs();
    resetMockQuota();
    resetMockUploads();
    vi.mocked(generateGeminiDiagnosis).mockReset();
    vi.mocked(generateEvolinkMakeupImage).mockReset();
    vi.mocked(generateGeminiMakeupImage).mockReset();
  });

  it("keeps the mock reference fallback path for local smoke tests", async () => {
    await saveUploadRecord(uploadRecord({ status: "validated" }));

    const result = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look,
      idempotencyKey: "request_1",
      bindings: { TRYON_PROVIDER: "mock" },
    });

    expect(result.job).toMatchObject({
      status: "succeeded",
      resultKind: "reference-fallback",
      resultImage: look.image,
    });
    expect(result.quota).toMatchObject({ remaining: 2 });
    await expect(getStoredJobById("visitor_1", result.job.id)).resolves.toEqual(
      result.job,
    );
    expect(generateGeminiDiagnosis).not.toHaveBeenCalled();
  });

  it("runs Gemini diagnosis, stores the diagnosis, and finishes with a reference image", async () => {
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
    vi.mocked(generateGeminiDiagnosis).mockResolvedValue({
      result: validDiagnosis(),
      model: "gemini-2.5-flash-lite",
      durationMs: 1200,
      usage: { promptTokens: 10, outputTokens: 20, totalTokens: 30 },
    });
    vi.mocked(generateGeminiMakeupImage).mockRejectedValue(
      new GeminiImageError("GEMINI_IMAGE_UNAVAILABLE", "no image"),
    );

    const bindings: RuntimeBindings = {
      TRYON_PROVIDER: "gemini",
      GEMINI_API_KEY: "secret",
      GEMINI_MODEL_FREE: "gemini-2.5-flash-lite",
      GEMINI_TIMEOUT_MS: "120000",
      USER_UPLOADS: bucketWithBytes([1, 2, 3]),
    };
    const created = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look,
      idempotencyKey: "request_1",
      bindings,
      audienceContext: jaAudienceContext,
    });

    expect(created.job).toMatchObject({
      status: "created",
      locale: "ja-JP",
    });
    expect(created.quota).toMatchObject({ remaining: 2 });
    expect(generateGeminiDiagnosis).not.toHaveBeenCalled();

    const result = await processTryOnJob({
      userId: "visitor_1",
      jobId: created.job.id,
      look,
      bindings,
      audienceContext: jaAudienceContext,
    });

    expect(result?.job).toMatchObject({
      status: "succeeded",
      resultKind: "reference-fallback",
      resultImage: look.image,
    });
    expect(result?.job.disclaimer).toContain("ABS");
    expect(result?.job.disclaimer).not.toMatch(/Gemini|Evolink/);
    expect(result?.quota).toMatchObject({ remaining: 2 });
    await expect(
      getDiagnosisRecordByJobId(result!.job.id),
    ).resolves.toMatchObject({
      jobId: result!.job.id,
      result: { confidence: { band: "high" } },
    });
    expect(getMockAiCallLogs()).toMatchObject([
      {
        userId: "visitor_1",
        jobId: result!.job.id,
        provider: "gemini",
        operation: "diagnosis",
        status: "succeeded",
        totalTokens: 30,
      },
      {
        provider: "gemini",
        operation: "image_generation",
        status: "failed",
        errorCode: "GEMINI_IMAGE_UNAVAILABLE",
      },
    ]);
    expect(generateGeminiDiagnosis).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: "secret",
        model: "gemini-2.5-flash-lite",
        preferredLookSlug: look.slug,
        locale: "ja-JP",
      }),
    );
    expect(generateGeminiMakeupImage).toHaveBeenCalled();
    expect(generateEvolinkMakeupImage).not.toHaveBeenCalled();
  });

  it("generates a Gemini makeup image and stores the private result in R2", async () => {
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
    vi.mocked(generateGeminiDiagnosis).mockResolvedValue({
      result: validDiagnosis(),
      model: "gemini-2.5-flash-lite",
      durationMs: 1200,
      usage: { promptTokens: 10, outputTokens: 20, totalTokens: 30 },
    });
    vi.mocked(generateGeminiMakeupImage).mockResolvedValue({
      image: {
        data: new Uint8Array([7, 8, 9]).buffer,
        contentType: "image/png",
      },
      model: "gemini-2.5-flash-image",
      durationMs: 5200,
      usage: { promptTokens: 12, outputTokens: 0, totalTokens: 12 },
    });
    const bucket = bucketWithBytes([1, 2, 3]);

    const bindings: RuntimeBindings = {
      TRYON_PROVIDER: "gemini",
      GEMINI_API_KEY: "secret",
      GEMINI_MODEL_FREE: "gemini-2.5-flash-lite",
      GEMINI_IMAGE_MODEL: "gemini-2.5-flash-image",
      USER_UPLOADS: bucket,
    };
    const created = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look,
      idempotencyKey: "request_1",
      bindings,
    });
    expect(created.job.status).toBe("created");

    const result = await processTryOnJob({
      userId: "visitor_1",
      jobId: created.job.id,
      look,
      bindings,
    });

    expect(result?.job).toMatchObject({
      status: "succeeded",
      resultKind: "ai-generated",
      resultImage: `/api/tryon-jobs/${result!.job.id}/result`,
      resultR2Key: `results/visitor_1/${result!.job.id}/result.png`,
    });
    expect(result?.job.disclaimer).toContain("ABS");
    expect(result?.job.disclaimer).not.toMatch(/Gemini|Evolink/);
    expect(bucket.put).toHaveBeenCalledWith(
      `results/visitor_1/${result!.job.id}/result.png`,
      expect.any(ArrayBuffer),
      expect.objectContaining({
        httpMetadata: { contentType: "image/png" },
        customMetadata: expect.objectContaining({
          provider: "gemini",
          model: "gemini-2.5-flash-image",
        }),
      }),
    );
    expect(getMockAiCallLogs()).toMatchObject([
      { provider: "gemini", operation: "diagnosis", status: "succeeded" },
      {
        provider: "gemini",
        operation: "image_generation",
        status: "succeeded",
        totalTokens: 12,
      },
    ]);
    expect(generateEvolinkMakeupImage).not.toHaveBeenCalled();
  });

  it("generates an Evolink makeup image and stores the private result in R2", async () => {
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
    vi.mocked(generateGeminiDiagnosis).mockResolvedValue({
      result: validDiagnosis(),
      model: "gemini-2.5-flash-lite",
      durationMs: 1200,
      usage: { promptTokens: 10, outputTokens: 20, totalTokens: 30 },
    });
    vi.mocked(generateEvolinkMakeupImage).mockResolvedValue({
      image: {
        data: new Uint8Array([4, 5, 6]).buffer,
        contentType: "image/png",
        sourceUrl: "https://cdn.evolink.ai/result.png",
      },
      taskId: "evolink_task_1",
      model: "wan2.5-image-to-image",
      durationMs: 4500,
      estimatedCostMicros: 140_000,
    });
    const bucket = bucketWithBytes([1, 2, 3]);

    const bindings: RuntimeBindings = {
      TRYON_PROVIDER: "gemini",
      GEMINI_API_KEY: "secret",
      GEMINI_MODEL_FREE: "gemini-2.5-flash-lite",
      IMAGE_PROVIDER: "evolink",
      EVOLINK_API_KEY: "evolink-secret",
      EVOLINK_IMAGE_MODEL: "wan2.5-image-to-image",
      USER_UPLOADS: bucket,
    };
    const created = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look,
      idempotencyKey: "request_1",
      bindings,
    });
    expect(created.job.status).toBe("created");

    const result = await processTryOnJob({
      userId: "visitor_1",
      jobId: created.job.id,
      look,
      bindings,
    });

    expect(result?.job).toMatchObject({
      status: "succeeded",
      resultKind: "ai-generated",
      resultImage: `/api/tryon-jobs/${result!.job.id}/result`,
      resultR2Key: `results/visitor_1/${result!.job.id}/result.png`,
    });
    expect(bucket.put).toHaveBeenCalledWith(
      `results/visitor_1/${result!.job.id}/result.png`,
      expect.any(ArrayBuffer),
      expect.objectContaining({
        httpMetadata: { contentType: "image/png" },
        customMetadata: expect.objectContaining({
          provider: "evolink",
          taskId: "evolink_task_1",
        }),
      }),
    );
    expect(getMockAiCallLogs()).toMatchObject([
      { provider: "gemini", operation: "diagnosis", status: "succeeded" },
      {
        provider: "evolink",
        operation: "image_generation",
        status: "succeeded",
        estimatedCostMicros: 140_000,
      },
    ]);
  });

  it("falls back to a reference image when Evolink image generation fails", async () => {
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
    vi.mocked(generateGeminiDiagnosis).mockResolvedValue({
      result: validDiagnosis(),
      model: "gemini-2.5-flash-lite",
      durationMs: 1200,
      usage: { promptTokens: 10, outputTokens: 20, totalTokens: 30 },
    });
    vi.mocked(generateEvolinkMakeupImage).mockRejectedValue(
      new EvolinkImageError("EVOLINK_TASK_FAILED", "policy"),
    );

    const bindings: RuntimeBindings = {
      TRYON_PROVIDER: "gemini",
      GEMINI_API_KEY: "secret",
      GEMINI_MODEL_FREE: "gemini-2.5-flash-lite",
      IMAGE_PROVIDER: "evolink",
      EVOLINK_API_KEY: "evolink-secret",
      USER_UPLOADS: bucketWithBytes([1]),
    };
    const created = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look,
      idempotencyKey: "request_1",
      bindings,
    });

    const result = await processTryOnJob({
      userId: "visitor_1",
      jobId: created.job.id,
      look,
      bindings,
    });

    expect(result?.job).toMatchObject({
      status: "succeeded",
      resultKind: "reference-fallback",
      resultImage: look.image,
    });
    expect(getMockAiCallLogs()).toMatchObject([
      { provider: "gemini", operation: "diagnosis", status: "succeeded" },
      {
        provider: "evolink",
        operation: "image_generation",
        status: "failed",
        errorCode: "EVOLINK_TASK_FAILED",
      },
    ]);
  });

  it("marks failed Gemini jobs and refunds quota once", async () => {
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
    vi.mocked(generateGeminiDiagnosis).mockRejectedValue(
      new DiagnosisProviderError("GEMINI_BLOCKED", "SAFETY"),
    );

    const bindings: RuntimeBindings = {
      TRYON_PROVIDER: "gemini",
      GEMINI_API_KEY: "secret",
      GEMINI_MODEL_FREE: "gemini-2.5-flash-lite",
      USER_UPLOADS: bucketWithBytes([1]),
    };
    const created = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look,
      idempotencyKey: "request_1",
      bindings,
    });

    expect(created.job.status).toBe("created");
    expect(created.quota).toMatchObject({ remaining: 2 });

    const result = await processTryOnJob({
      userId: "visitor_1",
      jobId: created.job.id,
      look,
      bindings,
    });

    expect(result?.job).toMatchObject({
      status: "failed",
      errorCode: "GEMINI_BLOCKED",
    });
    expect(result?.quota).toMatchObject({ remaining: 3 });
    await expect(getQuotaSnapshot("visitor_1")).resolves.toMatchObject({
      remaining: 3,
    });
    expect(getMockAiCallLogs()).toMatchObject([
      {
        provider: "gemini",
        operation: "diagnosis",
        status: "failed",
        errorCode: "GEMINI_BLOCKED",
      },
    ]);
  });

  it("requires private upload storage before real Gemini diagnosis", async () => {
    await saveUploadRecord(uploadRecord({ status: "validated" }));

    await expect(
      createTryOnJob({
        userId: "visitor_1",
        uploadId: "upload_1",
        look,
        idempotencyKey: "request_1",
        bindings: { TRYON_PROVIDER: "gemini" },
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<TryOnJobServiceError>>({
        code: "UPLOAD_STORAGE_REQUIRED",
      }),
    );
    await expect(getQuotaSnapshot("visitor_1")).resolves.toMatchObject({
      remaining: 3,
    });
  });
});

function uploadRecord(overrides: {
  status?: "validated" | "stored";
  r2Key?: string;
}) {
  return {
    id: "upload_1",
    userId: "visitor_1",
    r2Key: overrides.r2Key,
    status: overrides.status ?? "stored",
    contentType: "image/jpeg",
    sizeBytes: 3,
    width: 512,
    height: 768,
    orientation: 1,
    deleteAfter: "2026-07-07T00:00:00.000Z",
    createdAt: "2026-06-07T00:00:00.000Z",
  };
}

function bucketWithBytes(bytes: number[]) {
  return {
    get: vi.fn(async () => ({
      body: new Uint8Array(bytes).buffer,
      httpMetadata: { contentType: "image/jpeg" },
    })),
    put: vi.fn(async () => undefined),
    delete: vi.fn(async () => undefined),
  };
}

function validDiagnosis(): DiagnosisResult {
  return {
    schemaVersion: "2026-06-07",
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
    disclaimer:
      "AI 建议仅供美妆参考，不构成医疗或专业意见；实际效果因光线、设备和个人条件而异。",
  };
}
