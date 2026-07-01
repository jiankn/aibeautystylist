import { beforeEach, describe, expect, it, vi } from "vitest";

import { lookCatalog } from "../data/lookCatalog";
import type { AudienceContext } from "../data/makeup/audienceTypes";
import { getMockAiCallLogs, resetMockAiCallLogs } from "./aiCallLogs";
import {
  DIAGNOSIS_DISCLAIMER,
  DIAGNOSIS_SCHEMA_VERSION,
  type DiagnosisResult,
} from "./diagnosis";
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
import {
  analyzeMakeupReference,
  evaluateMakeupTransfer,
} from "./geminiMakeupTransfer";
import {
  MAKEUP_REFERENCE_SPEC_VERSION,
  MAKEUP_TRANSFER_QUALITY_VERSION,
  type MakeupReferenceSpec,
  type MakeupTransferQuality,
} from "./makeupTransfer";
import { getStoredJobById, resetMockJobs } from "./jobs";
import {
  privateTemplateToLook,
  resetMockPrivateLookTemplates,
  savePrivateLookTemplate,
} from "./privateLookTemplates";
import { getQuotaSnapshot, resetMockQuota } from "./quota";
import type { RuntimeBindings } from "./runtime";
import { resetMockSubscriptions, upsertSubscription } from "./subscriptions";
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

vi.mock("./geminiMakeupTransfer", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./geminiMakeupTransfer")>();
  return {
    ...actual,
    analyzeMakeupReference: vi.fn(),
    evaluateMakeupTransfer: vi.fn(),
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
    resetMockPrivateLookTemplates();
    resetMockQuota();
    resetMockSubscriptions();
    resetMockUploads();
    vi.mocked(generateGeminiDiagnosis).mockReset();
    vi.mocked(generateEvolinkMakeupImage).mockReset();
    vi.mocked(generateGeminiMakeupImage).mockReset();
    vi.mocked(analyzeMakeupReference).mockReset();
    vi.mocked(evaluateMakeupTransfer).mockReset();
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

  it("runs direct image generation for try-on jobs without storing diagnosis", async () => {
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
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
      purpose: "tryon",
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
    ).resolves.toBeUndefined();
    expect(getMockAiCallLogs()).toMatchObject([
      {
        provider: "gemini",
        operation: "image_generation",
        status: "failed",
        errorCode: "GEMINI_IMAGE_UNAVAILABLE",
      },
    ]);
    expect(generateGeminiDiagnosis).not.toHaveBeenCalled();
    expect(generateGeminiMakeupImage).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining("Silently use visible cues"),
      }),
    );
    const imagePrompt =
      vi.mocked(generateGeminiMakeupImage).mock.calls[0]?.[0].prompt ?? "";
    expect(imagePrompt).not.toContain("Beauty diagnosis context");
    expect(generateEvolinkMakeupImage).not.toHaveBeenCalled();
  });

  it("uses a Premium private reference as image 1 and the selfie as image 2", async () => {
    const privateTemplate = {
      id: "template_1",
      userId: "visitor_1",
      title: "Soft plum reference",
      r2Key: "private-templates/visitor_1/template_1/reference.webp",
      contentType: "image/webp",
      sizeBytes: 2,
      width: 900,
      height: 1200,
      status: "active" as const,
      createdAt: "2026-06-30T00:00:00.000Z",
      updatedAt: "2026-06-30T00:00:00.000Z",
    };
    await upsertSubscription({
      userId: "visitor_1",
      stripeSubscriptionId: "sub_premium_private",
      planCode: "premium",
      status: "active",
      currentPeriodEnd: "2026-07-30T00:00:00.000Z",
    });
    await savePrivateLookTemplate(privateTemplate);
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
    vi.mocked(generateGeminiMakeupImage).mockResolvedValue({
      image: {
        data: new Uint8Array([9, 9]).buffer,
        contentType: "image/png",
      },
      model: "gemini-image-test",
      durationMs: 800,
      usage: {},
    });
    vi.mocked(analyzeMakeupReference).mockResolvedValue({
      result: reflectiveMakeupSpec(),
      model: "gemini-analysis-test",
      durationMs: 300,
      usage: {},
    });
    vi.mocked(evaluateMakeupTransfer).mockResolvedValue({
      result: passingMakeupQuality(),
      model: "gemini-analysis-test",
      durationMs: 300,
      usage: {},
    });
    const bucket = {
      get: vi.fn(async (key: string) => ({
        body:
          key === privateTemplate.r2Key
            ? new Uint8Array([1, 2]).buffer
            : new Uint8Array([3, 4]).buffer,
        httpMetadata: {
          contentType:
            key === privateTemplate.r2Key ? "image/webp" : "image/jpeg",
        },
      })),
      put: vi.fn(async () => undefined),
      delete: vi.fn(async () => undefined),
    };
    const bindings: RuntimeBindings = {
      TRYON_PROVIDER: "gemini",
      IMAGE_PROVIDER: "evolink",
      GEMINI_API_KEY: "secret",
      GEMINI_IMAGE_MODEL: "gemini-image-test",
      EVOLINK_API_KEY: "evolink-secret",
      USER_UPLOADS: bucket,
    };
    const privateLook = privateTemplateToLook(privateTemplate);
    const created = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look: privateLook,
      idempotencyKey: "private_request_1",
      bindings,
      privateTemplate,
    });

    const result = await processTryOnJob({
      userId: "visitor_1",
      jobId: created.job.id,
      look: privateLook,
      bindings,
    });

    expect(result?.job).toMatchObject({
      status: "succeeded",
      lookSource: "private-template",
      privateTemplateId: privateTemplate.id,
      resultKind: "ai-generated",
    });
    expect(generateEvolinkMakeupImage).not.toHaveBeenCalled();
    expect(generateGeminiMakeupImage).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining(
          "output must visibly change the selfie's makeup",
        ),
        labeledImages: [
          expect.objectContaining({
            label: expect.stringContaining("MAKEUP REFERENCE IMAGE"),
            mimeType: "image/webp",
          }),
          expect.objectContaining({
            label: expect.stringContaining("USER SELFIE"),
            mimeType: "image/jpeg",
          }),
        ],
      }),
    );
    const images =
      vi.mocked(generateGeminiMakeupImage).mock.calls[0]?.[0].labeledImages ??
      [];
    expect([...new Uint8Array(images[0]!.data)]).toEqual([1, 2]);
    expect([...new Uint8Array(images[1]!.data)]).toEqual([3, 4]);
    expect(analyzeMakeupReference).toHaveBeenCalledOnce();
    expect(evaluateMakeupTransfer).toHaveBeenCalledOnce();
    expect(result?.job).toMatchObject({
      makeupSpecVersion: MAKEUP_REFERENCE_SPEC_VERSION,
      makeupQualityScore: 92,
      makeupGenerationAttempts: 1,
    });
  });

  it("retries a private transfer once with quality-review corrections", async () => {
    const privateTemplate = {
      id: "template_retry",
      userId: "visitor_1",
      title: "Reflective lid reference",
      r2Key: "private-templates/visitor_1/template_retry/reference.webp",
      contentType: "image/webp",
      sizeBytes: 2,
      width: 900,
      height: 1200,
      status: "active" as const,
      createdAt: "2026-06-30T00:00:00.000Z",
      updatedAt: "2026-06-30T00:00:00.000Z",
    };
    await upsertSubscription({
      userId: "visitor_1",
      stripeSubscriptionId: "sub_premium_retry",
      planCode: "premium",
      status: "active",
      currentPeriodEnd: "2026-07-30T00:00:00.000Z",
    });
    await savePrivateLookTemplate(privateTemplate);
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
    vi.mocked(analyzeMakeupReference).mockResolvedValue({
      result: reflectiveMakeupSpec(),
      model: "gemini-analysis-test",
      durationMs: 300,
      usage: {},
    });
    vi.mocked(generateGeminiMakeupImage)
      .mockResolvedValueOnce(generatedImage([7]))
      .mockResolvedValueOnce(generatedImage([8]));
    vi.mocked(evaluateMakeupTransfer)
      .mockResolvedValueOnce({
        result: failingMakeupQuality(),
        model: "gemini-analysis-test",
        durationMs: 300,
        usage: {},
      })
      .mockResolvedValueOnce({
        result: passingMakeupQuality(),
        model: "gemini-analysis-test",
        durationMs: 300,
        usage: {},
      });
    const bucket = bucketWithBytes([1, 2]);
    const bindings: RuntimeBindings = {
      TRYON_PROVIDER: "gemini",
      GEMINI_API_KEY: "secret",
      GEMINI_IMAGE_MODEL: "gemini-image-test",
      USER_UPLOADS: bucket,
    };
    const privateLook = privateTemplateToLook(privateTemplate);
    const created = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look: privateLook,
      idempotencyKey: "private_retry_request",
      bindings,
      privateTemplate,
    });

    const result = await processTryOnJob({
      userId: "visitor_1",
      jobId: created.job.id,
      look: privateLook,
      bindings,
    });

    expect(result?.job).toMatchObject({
      status: "succeeded",
      makeupGenerationAttempts: 2,
      makeupQualityScore: 92,
    });
    expect(generateGeminiMakeupImage).toHaveBeenCalledTimes(2);
    expect(
      vi.mocked(generateGeminiMakeupImage).mock.calls[1]?.[0].prompt,
    ).toContain("Retry corrections: wet-look silver lid shimmer");
    expect(evaluateMakeupTransfer).toHaveBeenCalledTimes(2);
  });

  it("rejects and refunds a private result that fails both quality checks", async () => {
    const privateTemplate = {
      id: "template_rejected",
      userId: "visitor_1",
      title: "Reflective lid reference",
      r2Key: "private-templates/visitor_1/template_rejected/reference.webp",
      contentType: "image/webp",
      sizeBytes: 2,
      width: 900,
      height: 1200,
      status: "active" as const,
      referenceSha256: "reference-hash",
      makeupSpecStatus: "ready" as const,
      makeupSpecVersion: MAKEUP_REFERENCE_SPEC_VERSION,
      makeupSpec: reflectiveMakeupSpec(),
      createdAt: "2026-06-30T00:00:00.000Z",
      updatedAt: "2026-06-30T00:00:00.000Z",
    };
    await upsertSubscription({
      userId: "visitor_1",
      stripeSubscriptionId: "sub_premium_rejected",
      planCode: "premium",
      status: "active",
      currentPeriodEnd: "2026-07-30T00:00:00.000Z",
    });
    await savePrivateLookTemplate(privateTemplate);
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
    vi.mocked(generateGeminiMakeupImage).mockResolvedValue(generatedImage([7]));
    vi.mocked(evaluateMakeupTransfer).mockResolvedValue({
      result: failingMakeupQuality(),
      model: "gemini-analysis-test",
      durationMs: 300,
      usage: {},
    });
    const bucket = bucketWithBytes([1, 2]);
    const bindings: RuntimeBindings = {
      TRYON_PROVIDER: "gemini",
      GEMINI_API_KEY: "secret",
      GEMINI_IMAGE_MODEL: "gemini-image-test",
      USER_UPLOADS: bucket,
    };
    const privateLook = privateTemplateToLook(privateTemplate);
    const created = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look: privateLook,
      idempotencyKey: "private_rejected_request",
      bindings,
      privateTemplate,
    });

    const result = await processTryOnJob({
      userId: "visitor_1",
      jobId: created.job.id,
      look: privateLook,
      bindings,
    });

    expect(result?.job).toMatchObject({
      status: "failed",
      errorCode: "MAKEUP_TRANSFER_QUALITY_FAILED",
    });
    expect(result?.quota).toMatchObject({ remaining: 150 });
    expect(generateGeminiMakeupImage).toHaveBeenCalledTimes(2);
    expect(evaluateMakeupTransfer).toHaveBeenCalledTimes(2);
    expect(bucket.put).not.toHaveBeenCalled();
  });

  it("runs professional diagnosis only for diagnosis-purpose jobs", async () => {
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
    vi.mocked(generateGeminiDiagnosis).mockResolvedValue({
      result: validDiagnosis(),
      model: "gemini-2.5-flash-lite",
      durationMs: 1200,
      usage: { promptTokens: 10, outputTokens: 20, totalTokens: 30 },
    });

    const bindings: RuntimeBindings = {
      TRYON_PROVIDER: "gemini",
      GEMINI_API_KEY: "secret",
      GEMINI_MODEL_FREE: "gemini-2.5-flash-lite",
      USER_UPLOADS: bucketWithBytes([1, 2, 3]),
    };
    const created = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look,
      idempotencyKey: "diagnosis_request_1",
      bindings,
      audienceContext: jaAudienceContext,
      purpose: "diagnosis",
    });

    expect(created.job).toMatchObject({
      status: "created",
      locale: "ja-JP",
      purpose: "diagnosis",
    });

    const result = await processTryOnJob({
      userId: "visitor_1",
      jobId: created.job.id,
      look,
      bindings,
      audienceContext: jaAudienceContext,
    });

    expect(result?.job).toMatchObject({
      status: "succeeded",
      purpose: "diagnosis",
    });
    expect(result?.job.resultImage).toBeUndefined();
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
    ]);
    expect(generateGeminiDiagnosis).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: "secret",
        model: "gemini-2.5-flash-lite",
        preferredLookSlug: look.slug,
        locale: "ja-JP",
      }),
    );
    expect(generateGeminiMakeupImage).not.toHaveBeenCalled();
    expect(generateEvolinkMakeupImage).not.toHaveBeenCalled();
  });

  it("generates a Gemini makeup image and stores the private result in R2", async () => {
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
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
      {
        provider: "gemini",
        operation: "image_generation",
        status: "succeeded",
        totalTokens: 12,
      },
    ]);
    await expect(
      getDiagnosisRecordByJobId(result!.job.id),
    ).resolves.toBeUndefined();
    expect(generateGeminiDiagnosis).not.toHaveBeenCalled();
    expect(generateEvolinkMakeupImage).not.toHaveBeenCalled();
  });

  it("generates an Evolink makeup image and stores the private result in R2", async () => {
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
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
      {
        provider: "evolink",
        operation: "image_generation",
        status: "succeeded",
        estimatedCostMicros: 140_000,
      },
    ]);
    await expect(
      getDiagnosisRecordByJobId(result!.job.id),
    ).resolves.toBeUndefined();
    expect(generateGeminiDiagnosis).not.toHaveBeenCalled();
  });

  it("falls back to a reference image when Evolink image generation fails", async () => {
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
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
      {
        provider: "evolink",
        operation: "image_generation",
        status: "failed",
        errorCode: "EVOLINK_TASK_FAILED",
      },
    ]);
    await expect(
      getDiagnosisRecordByJobId(result!.job.id),
    ).resolves.toBeUndefined();
    expect(generateGeminiDiagnosis).not.toHaveBeenCalled();
  });

  it("marks failed diagnosis jobs and refunds quota once", async () => {
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
      idempotencyKey: "diagnosis_request_2",
      bindings,
      purpose: "diagnosis",
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
      purpose: "diagnosis",
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

  it("requires private upload storage before real Gemini generation", async () => {
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

function reflectiveMakeupSpec(): MakeupReferenceSpec {
  const subtleArea = {
    colors: ["neutral"],
    placement: ["natural placement"],
    finish: ["natural"],
    intensity: "subtle" as const,
  };
  return {
    schemaVersion: MAKEUP_REFERENCE_SPEC_VERSION,
    summary: "Silver-gold reflective wet-look eyelids with nude glossy lips",
    focalAreas: ["mobile eyelids", "inner corners"],
    base: { ...subtleArea, finish: ["luminous", "dewy"] },
    eyes: {
      colors: ["silver white", "pale gold"],
      placement: ["mobile lid", "inner corner", "lower inner lash line"],
      finish: ["wet-look", "reflective shimmer"],
      intensity: "strong",
    },
    brows: subtleArea,
    cheeks: {
      ...subtleArea,
      colors: ["neutral pale pink"],
      finish: ["luminous"],
    },
    lips: {
      colors: ["nude pink"],
      placement: ["full lips"],
      finish: ["transparent gloss"],
      intensity: "subtle",
    },
    contourHighlight: {
      ...subtleArea,
      placement: ["inner corners", "brow bone", "cheekbone"],
      finish: ["luminous highlight"],
    },
    mustMatch: [
      "wet-look silver-gold mobile lid shimmer",
      "bright reflective inner corners",
      "nude-pink glossy lips",
    ],
    mustAvoid: [
      "matte warm brown eyeshadow",
      "large-area peach blush",
      "matte brick-red lips",
    ],
  };
}

function passingMakeupQuality(): MakeupTransferQuality {
  return {
    schemaVersion: MAKEUP_TRANSFER_QUALITY_VERSION,
    overallScore: 92,
    makeupSimilarityScore: 94,
    identityPreservationScore: 96,
    criticalMissing: [],
    conflicts: [],
    correctionInstructions: [],
  };
}

function failingMakeupQuality(): MakeupTransferQuality {
  return {
    schemaVersion: MAKEUP_TRANSFER_QUALITY_VERSION,
    overallScore: 52,
    makeupSimilarityScore: 40,
    identityPreservationScore: 95,
    criticalMissing: ["wet-look silver lid shimmer"],
    conflicts: ["large-area peach blush"],
    correctionInstructions: [
      "add reflective silver shimmer across the visible mobile lid",
      "reduce peach blush",
    ],
  };
}

function generatedImage(bytes: number[]) {
  return {
    image: {
      data: new Uint8Array(bytes).buffer,
      contentType: "image/png",
    },
    model: "gemini-image-test",
    durationMs: 800,
    usage: {},
  };
}

function validDiagnosis(): DiagnosisResult {
  return {
    schemaVersion: DIAGNOSIS_SCHEMA_VERSION,
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
    reportSummary: {
      archetype: "柔雾通勤 · 柔夏",
      primaryStrategy: "以低对比、低饱和色彩保持清透感。",
      oneLineAdvice: "优先使用柔和冷中性色，避免过强对比。",
    },
    photoQuality: {
      level: "good",
      notes: ["正面照片清晰，适合基础妆容诊断。"],
    },
    makeupPlan: {
      base: ["使用轻薄柔雾底妆。"],
      brows: ["眉形保持自然干净。"],
      eyes: ["眼尾轻微加强清晰度。"],
      cheeks: ["腮红使用低饱和玫瑰调。"],
      lips: ["唇色选择柔和豆沙或玫瑰色。"],
      contourHighlight: ["修容和高光保持克制。"],
    },
    colorPalette: {
      recommended: [
        { name: "灰粉", usage: "cheeks" },
        { name: "柔棕", usage: "eyes" },
      ],
      avoid: ["高饱和橘红"],
    },
    scenarioStrategies: [
      {
        scenario: "work",
        lookName: "柔雾通勤",
        colors: ["灰粉", "柔棕"],
        keyTechniques: ["降低对比度"],
        avoid: ["强烈眼线"],
        validation: "自然光下妆面干净。",
      },
    ],
    recommendationReasoning: [
      {
        directionTitle: "柔雾通勤",
        matchedFactors: ["低对比度", "柔和配色"],
        watchOut: ["避免显灰"],
      },
    ],
    disclaimer: DIAGNOSIS_DISCLAIMER,
  };
}
