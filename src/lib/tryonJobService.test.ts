import { beforeEach, describe, expect, it, vi } from "vitest";

import { lookCatalog } from "../data/lookCatalog";
import type { AudienceContext } from "../data/makeup/audienceTypes";
import { getMockAiCallLogs, resetMockAiCallLogs } from "./aiCallLogs";
import {
  CATALOG_TRYON_QUALITY_VERSION,
  type CatalogTryOnQuality,
} from "./catalogTryOnQuality";
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
  analyzeEvolinkMakeupReference,
  evaluateEvolinkCatalogTryOnQuality,
  evaluateEvolinkMakeupTransfer,
  generateEvolinkDiagnosis,
} from "./evolinkVision";
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
import { getQuotaSnapshot, grantShareReward, resetMockQuota } from "./quota";
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

vi.mock("./evolinkVision", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./evolinkVision")>();
  return {
    ...actual,
    analyzeEvolinkMakeupReference: vi.fn(),
    evaluateEvolinkCatalogTryOnQuality: vi.fn(),
    evaluateEvolinkMakeupTransfer: vi.fn(),
    generateEvolinkDiagnosis: vi.fn(),
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
const matureLook = lookCatalog.find(
  (item) => item.slug === "mature-skin-radiance",
)!;
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
    vi.mocked(analyzeEvolinkMakeupReference).mockReset();
    vi.mocked(evaluateEvolinkCatalogTryOnQuality).mockReset();
    vi.mocked(evaluateEvolinkMakeupTransfer).mockReset();
    vi.mocked(generateEvolinkDiagnosis).mockReset();
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

  it("charges two shared credits for diagnosis and rejects a one-credit balance", async () => {
    await saveUploadRecord(uploadRecord({ status: "validated" }));

    const diagnosis = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look,
      idempotencyKey: "diagnosis_cost_1",
      bindings: { TRYON_PROVIDER: "mock" },
      purpose: "diagnosis",
    });

    expect(diagnosis.quota).toMatchObject({ remaining: 1 });

    await expect(
      createTryOnJob({
        userId: "visitor_1",
        uploadId: "upload_1",
        look,
        idempotencyKey: "diagnosis_cost_2",
        bindings: { TRYON_PROVIDER: "mock" },
        purpose: "diagnosis",
      }),
    ).rejects.toMatchObject({
      code: "QUOTA_EXHAUSTED",
      status: 409,
    });
    await expect(getQuotaSnapshot("visitor_1")).resolves.toMatchObject({
      remaining: 1,
    });
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

  it("pins paid catalog jobs to Pro high quality and Premium 2K routing", async () => {
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
    const bindings: RuntimeBindings = {
      TRYON_PROVIDER: "evolink",
      IMAGE_PROVIDER: "evolink",
      EVOLINK_API_KEY: "evolink-secret",
      EVOLINK_ACQUISITION_IMAGE_MODEL: "doubao-seedream-5.0-pro",
      USER_UPLOADS: bucketWithBytes([1, 2, 3]),
    };
    await upsertSubscription({
      userId: "visitor_1",
      stripeSubscriptionId: "sub_quality_route",
      planCode: "pro",
      status: "active",
      currentPeriodEnd: "2026-07-30T00:00:00.000Z",
    });
    const pro = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look,
      idempotencyKey: "pro_quality_route",
      bindings,
    });
    expect(pro.job.qualityTier).toBe("pro");

    await upsertSubscription({
      userId: "visitor_1",
      stripeSubscriptionId: "sub_quality_route",
      planCode: "premium",
      status: "active",
      currentPeriodEnd: "2026-07-30T00:00:00.000Z",
    });
    const premium = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look,
      idempotencyKey: "premium_quality_route",
      bindings,
    });
    expect(premium.job.qualityTier).toBe("premium");
    vi.mocked(generateEvolinkMakeupImage).mockResolvedValue(
      generatedEvolinkImage([4, 5, 6], "doubao-seedream-5.0-pro"),
    );
    vi.mocked(evaluateEvolinkCatalogTryOnQuality).mockResolvedValue({
      result: passingCatalogQuality(),
      model: "doubao-seed-2.0-lite",
      durationMs: 180,
      usage: {},
    });
    await processTryOnJob({
      userId: "visitor_1",
      jobId: premium.job.id,
      look,
      bindings,
    });
    expect(generateEvolinkMakeupImage).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "doubao-seedream-5.0-pro",
        quality: "2K",
      }),
    );
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
    vi.mocked(generateEvolinkMakeupImage).mockResolvedValue({
      image: {
        data: new Uint8Array([9, 9]).buffer,
        contentType: "image/png",
        sourceUrl: "https://cdn.evolink.ai/private-result.png",
      },
      taskId: "private_task_1",
      model: "doubao-seedream-5.0-pro",
      durationMs: 800,
    });
    vi.mocked(analyzeEvolinkMakeupReference).mockResolvedValue({
      result: reflectiveMakeupSpec(),
      model: "doubao-seed-2.0-lite",
      durationMs: 300,
      usage: {},
    });
    vi.mocked(evaluateEvolinkMakeupTransfer).mockResolvedValue({
      result: passingMakeupQuality(),
      model: "doubao-seed-2.0-lite",
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
      TRYON_PROVIDER: "evolink",
      IMAGE_PROVIDER: "evolink",
      EVOLINK_API_KEY: "evolink-secret",
      EVOLINK_VISION_MODEL: "doubao-seed-2.0-lite",
      EVOLINK_PRIVATE_IMAGE_MODEL: "doubao-seedream-5.0-pro",
      EVOLINK_PRIVATE_FALLBACK_IMAGE_MODEL: "gpt-image-2",
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
    expect(generateGeminiMakeupImage).not.toHaveBeenCalled();
    expect(generateEvolinkMakeupImage).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "doubao-seedream-5.0-pro",
        prompt: expect.stringContaining(
          "output must visibly change the selfie's makeup",
        ),
        images: [
          expect.objectContaining({
            mimeType: "image/webp",
          }),
          expect.objectContaining({
            mimeType: "image/jpeg",
          }),
        ],
        size: "2:3",
        quality: "1K",
      }),
    );
    const images =
      vi.mocked(generateEvolinkMakeupImage).mock.calls[0]?.[0].images ?? [];
    expect([...new Uint8Array(images[0]!.data)]).toEqual([1, 2]);
    expect([...new Uint8Array(images[1]!.data)]).toEqual([3, 4]);
    expect(analyzeEvolinkMakeupReference).toHaveBeenCalledOnce();
    expect(evaluateEvolinkMakeupTransfer).toHaveBeenCalledOnce();
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
    vi.mocked(analyzeEvolinkMakeupReference).mockResolvedValue({
      result: reflectiveMakeupSpec(),
      model: "doubao-seed-2.0-lite",
      durationMs: 300,
      usage: {},
    });
    vi.mocked(generateEvolinkMakeupImage)
      .mockResolvedValueOnce(
        generatedEvolinkImage([7], "doubao-seedream-5.0-pro"),
      )
      .mockResolvedValueOnce(generatedEvolinkImage([8], "gpt-image-2"));
    vi.mocked(evaluateEvolinkMakeupTransfer)
      .mockResolvedValueOnce({
        result: failingMakeupQuality(),
        model: "doubao-seed-2.0-lite",
        durationMs: 300,
        usage: {},
      })
      .mockResolvedValueOnce({
        result: passingMakeupQuality(),
        model: "doubao-seed-2.0-lite",
        durationMs: 300,
        usage: {},
      });
    const bucket = bucketWithBytes([1, 2]);
    const bindings: RuntimeBindings = {
      TRYON_PROVIDER: "evolink",
      IMAGE_PROVIDER: "evolink",
      EVOLINK_API_KEY: "evolink-secret",
      EVOLINK_VISION_MODEL: "doubao-seed-2.0-lite",
      EVOLINK_PRIVATE_IMAGE_MODEL: "doubao-seedream-5.0-pro",
      EVOLINK_PRIVATE_FALLBACK_IMAGE_MODEL: "gpt-image-2",
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
    expect(generateEvolinkMakeupImage).toHaveBeenCalledTimes(2);
    expect(
      vi
        .mocked(generateEvolinkMakeupImage)
        .mock.calls.map(([request]) => request.model),
    ).toEqual(["doubao-seedream-5.0-pro", "gpt-image-2"]);
    expect(
      vi.mocked(generateEvolinkMakeupImage).mock.calls[1]?.[0].prompt,
    ).toContain("Retry corrections: wet-look silver lid shimmer");
    expect(
      vi.mocked(generateEvolinkMakeupImage).mock.calls[1]?.[0].prompt,
    ).toContain("Do not restart from or revert to the USER SELFIE");
    const retryImages =
      vi.mocked(generateEvolinkMakeupImage).mock.calls[1]?.[0].images ?? [];
    expect(retryImages).toHaveLength(3);
    expect(retryImages[2]?.filename).toBe("current-candidate.jpg");
    expect([...new Uint8Array(retryImages[2]!.data)]).toEqual([7]);
    expect(
      vi.mocked(generateEvolinkMakeupImage).mock.calls[1]?.[0],
    ).toMatchObject({ quality: "medium", resolution: "1K", size: "2:3" });
    expect(evaluateEvolinkMakeupTransfer).toHaveBeenCalledTimes(2);
  });

  it("retries when full-face base makeup leaves the forehead untreated", async () => {
    const privateTemplate = {
      id: "template_forehead_gap",
      userId: "visitor_1",
      title: "Continuous luminous base",
      r2Key: "private-templates/visitor_1/template_forehead_gap/reference.webp",
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
      stripeSubscriptionId: "sub_premium_forehead_gap",
      planCode: "premium",
      status: "active",
      currentPeriodEnd: "2026-07-30T00:00:00.000Z",
    });
    await savePrivateLookTemplate(privateTemplate);
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
    vi.mocked(generateGeminiMakeupImage)
      .mockResolvedValueOnce(generatedImage([7]))
      .mockResolvedValueOnce(generatedImage([8]));
    vi.mocked(evaluateMakeupTransfer)
      .mockResolvedValueOnce({
        result: foreheadGapQuality(),
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
      idempotencyKey: "private_forehead_gap_request",
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
    });
    const retryPrompt =
      vi.mocked(generateGeminiMakeupImage).mock.calls[1]?.[0].prompt ?? "";
    expect(retryPrompt).toContain("restore missing base coverage on forehead");
    expect(retryPrompt).toContain(
      "Do not leave the forehead untreated while the center face is covered",
    );
  });

  it("returns the best safe candidate when the retry regresses to the selfie", async () => {
    const privateTemplate = {
      id: "template_best_candidate",
      userId: "visitor_1",
      title: "Reflective lid reference",
      r2Key:
        "private-templates/visitor_1/template_best_candidate/reference.webp",
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
      stripeSubscriptionId: "sub_premium_best_candidate",
      planCode: "premium",
      status: "active",
      currentPeriodEnd: "2026-07-30T00:00:00.000Z",
    });
    await savePrivateLookTemplate(privateTemplate);
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
    vi.mocked(generateGeminiMakeupImage)
      .mockResolvedValueOnce(generatedImage([7]))
      .mockResolvedValueOnce(generatedImage([8]));
    vi.mocked(evaluateMakeupTransfer)
      .mockResolvedValueOnce({
        result: partialMakeupQuality(),
        model: "gemini-analysis-test",
        durationMs: 300,
        usage: {},
      })
      .mockResolvedValueOnce({
        result: noOpMakeupQuality(),
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
      idempotencyKey: "private_best_candidate_request",
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
      makeupQualityScore: 60,
    });
    expect(result?.quota).toMatchObject({ remaining: 148 });
    expect(bucket.put).toHaveBeenCalledOnce();
    expect([...new Uint8Array(bucket.put.mock.calls[0]![1])]).toEqual([7]);
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
    expect(created.quota).toMatchObject({ remaining: 1 });

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
    expect(result?.quota).toMatchObject({ remaining: 1 });
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

  it("routes diagnosis through EvoLink Doubao Seed 2.0 Lite", async () => {
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
    vi.mocked(generateEvolinkDiagnosis).mockResolvedValue({
      result: validDiagnosis(),
      model: "doubao-seed-2.0-lite",
      durationMs: 900,
      usage: { promptTokens: 8, outputTokens: 16, totalTokens: 24 },
    });
    const bindings: RuntimeBindings = {
      TRYON_PROVIDER: "evolink",
      EVOLINK_API_KEY: "evolink-secret",
      EVOLINK_VISION_MODEL: "doubao-seed-2.0-lite",
      USER_UPLOADS: bucketWithBytes([1, 2, 3]),
    };
    const created = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look,
      idempotencyKey: "evolink_diagnosis_request",
      bindings,
      purpose: "diagnosis",
    });

    const result = await processTryOnJob({
      userId: "visitor_1",
      jobId: created.job.id,
      look,
      bindings,
    });

    expect(result?.job.status).toBe("succeeded");
    expect(generateEvolinkDiagnosis).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: "evolink-secret",
        model: "doubao-seed-2.0-lite",
      }),
    );
    expect(generateGeminiDiagnosis).not.toHaveBeenCalled();
    expect(getMockAiCallLogs()).toMatchObject([
      {
        provider: "evolink",
        operation: "diagnosis",
        model: "doubao-seed-2.0-lite",
        status: "succeeded",
        totalTokens: 24,
      },
    ]);
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
    expect(created.job).toMatchObject({
      status: "created",
      qualityTier: "acquisition",
    });

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
    expect(generateGeminiMakeupImage).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gemini-2.5-flash-image" }),
    );
  });

  it("adds strict identity and texture constraints to the mature-skin Evolink prompt", async () => {
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
      model: "doubao-seedream-5.0-pro",
      durationMs: 4500,
      estimatedCostMicros: 140_000,
    });
    vi.mocked(evaluateEvolinkCatalogTryOnQuality).mockResolvedValue({
      result: passingCatalogQuality(),
      model: "doubao-seed-2.0-lite",
      durationMs: 180,
      usage: {},
    });
    const bucket = bucketWithBytes([1, 2, 3]);

    const bindings: RuntimeBindings = {
      TRYON_PROVIDER: "evolink",
      IMAGE_PROVIDER: "evolink",
      EVOLINK_API_KEY: "evolink-secret",
      EVOLINK_IMAGE_MODEL: "qwen-image-edit-plus",
      EVOLINK_IMAGE_FALLBACK_MODEL: "doubao-seedream-5.0-lite",
      EVOLINK_ACQUISITION_IMAGE_MODEL: "doubao-seedream-5.0-pro",
      EVOLINK_ACQUISITION_FALLBACK_IMAGE_MODEL: "gpt-image-2",
      USER_UPLOADS: bucket,
    };
    const created = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look: matureLook,
      idempotencyKey: "request_1",
      bindings,
    });
    expect(created.job).toMatchObject({
      status: "created",
      qualityTier: "acquisition",
    });

    const result = await processTryOnJob({
      userId: "visitor_1",
      jobId: created.job.id,
      look: matureLook,
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
          qualityTier: "acquisition",
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
      {
        provider: "evolink",
        operation: "makeup_transfer_quality",
        status: "succeeded",
      },
    ]);
    await expect(
      getDiagnosisRecordByJobId(result!.job.id),
    ).resolves.toBeUndefined();
    expect(generateGeminiDiagnosis).not.toHaveBeenCalled();
    expect(generateEvolinkMakeupImage).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "doubao-seedream-5.0-pro",
        quality: "1K",
        prompt: expect.stringContaining(
          "Do not remove, add, move, or redraw hands, arms",
        ),
      }),
    );
    const prompt = vi.mocked(generateEvolinkMakeupImage).mock.calls[0]?.[0]
      .prompt;
    expect(prompt).toContain("Highest-priority mature-skin no-caking");
    expect(prompt).toContain("sheer hydrating satin base");
    expect(prompt).toContain("softly lifted taupe eye makeup");
    expect(prompt).toContain(
      "cream rose blush placed high on the outer cheeks",
    );
    expect(prompt).toContain("hydrating rosewood satin lip");
    expect(prompt).toContain("no white stripe or blown highlight");
  });

  it("silently repairs a rejected acquisition result without charging another credit", async () => {
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
    vi.mocked(generateEvolinkMakeupImage)
      .mockResolvedValueOnce(
        generatedEvolinkImage([4, 5, 6], "doubao-seedream-5.0-pro"),
      )
      .mockResolvedValueOnce(generatedEvolinkImage([7, 8, 9], "gpt-image-2"));
    vi.mocked(evaluateEvolinkCatalogTryOnQuality)
      .mockResolvedValueOnce({
        result: failingCatalogQuality(),
        model: "doubao-seed-2.0-lite",
        durationMs: 180,
        usage: {},
      })
      .mockResolvedValueOnce({
        result: passingCatalogQuality(),
        model: "doubao-seed-2.0-lite",
        durationMs: 180,
        usage: {},
      });
    const bindings: RuntimeBindings = {
      TRYON_PROVIDER: "evolink",
      IMAGE_PROVIDER: "evolink",
      EVOLINK_API_KEY: "evolink-secret",
      EVOLINK_ACQUISITION_IMAGE_MODEL: "doubao-seedream-5.0-pro",
      EVOLINK_ACQUISITION_FALLBACK_IMAGE_MODEL: "gpt-image-2",
      USER_UPLOADS: bucketWithBytes([1, 2, 3]),
    };
    const created = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look: matureLook,
      idempotencyKey: "acquisition_repair_1",
      bindings,
    });

    const result = await processTryOnJob({
      userId: "visitor_1",
      jobId: created.job.id,
      look: matureLook,
      bindings,
    });

    expect(result?.job).toMatchObject({
      status: "succeeded",
      qualityTier: "acquisition",
      makeupQualityScore: 91,
      makeupGenerationAttempts: 2,
    });
    expect(result?.quota).toMatchObject({ remaining: 2 });
    expect(
      vi
        .mocked(generateEvolinkMakeupImage)
        .mock.calls.map(([request]) => request.model),
    ).toEqual(["doubao-seedream-5.0-pro", "gpt-image-2"]);
    expect(vi.mocked(generateEvolinkMakeupImage).mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({
        images: [
          expect.objectContaining({ filename: "original-selfie.jpg" }),
          expect.objectContaining({ filename: "current-candidate.jpg" }),
        ],
        prompt: expect.stringContaining("Restore the exact face geometry"),
      }),
    );
  });

  it("uses economy routing only after a free user's first three successful results", async () => {
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
    vi.mocked(generateEvolinkMakeupImage).mockResolvedValue(
      generatedEvolinkImage([4, 5, 6], "doubao-seedream-5.0-pro"),
    );
    vi.mocked(evaluateEvolinkCatalogTryOnQuality).mockResolvedValue({
      result: passingCatalogQuality(),
      model: "doubao-seed-2.0-lite",
      durationMs: 180,
      usage: {},
    });
    const bindings: RuntimeBindings = {
      TRYON_PROVIDER: "evolink",
      IMAGE_PROVIDER: "evolink",
      EVOLINK_API_KEY: "evolink-secret",
      EVOLINK_ACQUISITION_IMAGE_MODEL: "doubao-seedream-5.0-pro",
      EVOLINK_ACQUISITION_FALLBACK_IMAGE_MODEL: "gpt-image-2",
      EVOLINK_IMAGE_MODEL: "qwen-image-edit-plus",
      EVOLINK_IMAGE_FALLBACK_MODEL: "doubao-seedream-5.0-lite",
      USER_UPLOADS: bucketWithBytes([1, 2, 3]),
    };

    for (let index = 1; index <= 3; index += 1) {
      const created = await createTryOnJob({
        userId: "visitor_1",
        uploadId: "upload_1",
        look,
        idempotencyKey: `first_three_${index}`,
        bindings,
      });
      expect(created.job.qualityTier).toBe("acquisition");
      const completed = await processTryOnJob({
        userId: "visitor_1",
        jobId: created.job.id,
        look,
        bindings,
      });
      expect(completed?.job.status).toBe("succeeded");
    }
    await grantShareReward("visitor_1", "share_reward_job");
    vi.mocked(generateEvolinkMakeupImage).mockClear();
    vi.mocked(evaluateEvolinkCatalogTryOnQuality).mockClear();

    const fourth = await createTryOnJob({
      userId: "visitor_1",
      uploadId: "upload_1",
      look,
      idempotencyKey: "shared_fourth",
      bindings,
    });
    expect(fourth.job.qualityTier).toBe("standard");
    await processTryOnJob({
      userId: "visitor_1",
      jobId: fourth.job.id,
      look,
      bindings,
    });

    expect(generateEvolinkMakeupImage).toHaveBeenCalledWith(
      expect.objectContaining({ model: "qwen-image-edit-plus" }),
    );
    expect(evaluateEvolinkCatalogTryOnQuality).not.toHaveBeenCalled();
  });

  it("refunds an acquisition try when both high-quality image models fail", async () => {
    await saveUploadRecord(
      uploadRecord({ r2Key: "originals/visitor_1/upload_1/original.jpg" }),
    );
    vi.mocked(generateEvolinkMakeupImage).mockRejectedValue(
      new EvolinkImageError("EVOLINK_TASK_FAILED", "policy"),
    );

    const bindings: RuntimeBindings = {
      TRYON_PROVIDER: "evolink",
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
      status: "failed",
      errorCode: "MAKEUP_TRANSFER_QUALITY_FAILED",
    });
    expect(result?.quota).toMatchObject({ remaining: 3 });
    expect(getMockAiCallLogs()).toMatchObject([
      {
        provider: "evolink",
        operation: "image_generation",
        status: "failed",
        errorCode: "EVOLINK_TASK_FAILED",
      },
      {
        provider: "evolink",
        operation: "image_generation",
        status: "failed",
        errorCode: "EVOLINK_TASK_FAILED",
      },
    ]);
    expect(
      vi
        .mocked(generateEvolinkMakeupImage)
        .mock.calls.map(([request]) => request.model),
    ).toEqual(["doubao-seedream-5.0-pro", "gpt-image-2"]);
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
    expect(created.quota).toMatchObject({ remaining: 1 });

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
    put: vi.fn(
      async (_key: string, _value: ArrayBuffer, _options?: unknown) =>
        undefined,
    ),
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
    baseCoverage: {
      forehead: "medium",
      temples: "medium",
      nose: "medium",
      cheeks: "medium",
      chinJaw: "medium",
      expectedContinuity: "full-face",
    },
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
    baseCoverageContinuityScore: 94,
    baseCoverageMissing: [],
    criticalMissing: [],
    conflicts: [],
    correctionInstructions: [],
  };
}

function passingCatalogQuality(): CatalogTryOnQuality {
  return {
    schemaVersion: CATALOG_TRYON_QUALITY_VERSION,
    overallScore: 91,
    makeupExecutionScore: 88,
    identityPreservationScore: 97,
    scenePreservationScore: 98,
    skinTexturePreservationScore: 93,
    criticalDefects: [],
    correctionInstructions: [],
  };
}

function failingCatalogQuality(): CatalogTryOnQuality {
  return {
    schemaVersion: CATALOG_TRYON_QUALITY_VERSION,
    overallScore: 54,
    makeupExecutionScore: 72,
    identityPreservationScore: 76,
    scenePreservationScore: 88,
    skinTexturePreservationScore: 61,
    criticalDefects: ["Face shape drift and skin smoothing"],
    correctionInstructions: [
      "Restore the exact face geometry and real pore texture from the selfie",
    ],
  };
}

function failingMakeupQuality(): MakeupTransferQuality {
  return {
    schemaVersion: MAKEUP_TRANSFER_QUALITY_VERSION,
    overallScore: 52,
    makeupSimilarityScore: 40,
    identityPreservationScore: 95,
    baseCoverageContinuityScore: 90,
    baseCoverageMissing: [],
    criticalMissing: ["wet-look silver lid shimmer"],
    conflicts: ["large-area peach blush"],
    correctionInstructions: [
      "add reflective silver shimmer across the visible mobile lid",
      "reduce peach blush",
    ],
  };
}

function foreheadGapQuality(): MakeupTransferQuality {
  return {
    schemaVersion: MAKEUP_TRANSFER_QUALITY_VERSION,
    overallScore: 88,
    makeupSimilarityScore: 91,
    identityPreservationScore: 96,
    baseCoverageContinuityScore: 58,
    baseCoverageMissing: ["forehead"],
    criticalMissing: [],
    conflicts: ["forehead finish remains untreated"],
    correctionInstructions: [
      "continue the luminous foundation finish across the forehead",
    ],
  };
}

function partialMakeupQuality(): MakeupTransferQuality {
  return {
    schemaVersion: MAKEUP_TRANSFER_QUALITY_VERSION,
    overallScore: 60,
    makeupSimilarityScore: 55,
    identityPreservationScore: 95,
    baseCoverageContinuityScore: 82,
    baseCoverageMissing: [],
    criticalMissing: [],
    conflicts: ["lip gloss is too subtle"],
    correctionInstructions: ["increase lip gloss"],
  };
}

function noOpMakeupQuality(): MakeupTransferQuality {
  return {
    schemaVersion: MAKEUP_TRANSFER_QUALITY_VERSION,
    overallScore: 0,
    makeupSimilarityScore: 0,
    identityPreservationScore: 100,
    baseCoverageContinuityScore: 15,
    baseCoverageMissing: ["forehead", "temples", "nose", "cheeks", "chinJaw"],
    criticalMissing: ["silver shimmer eyeshadow", "high gloss lips"],
    conflicts: [],
    correctionInstructions: ["restore the focal makeup"],
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

function generatedEvolinkImage(bytes: number[], model: string) {
  return {
    image: {
      data: new Uint8Array(bytes).buffer,
      contentType: "image/png",
      sourceUrl: `https://cdn.evolink.ai/${model}.png`,
    },
    taskId: `task_${model}`,
    model,
    durationMs: 800,
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
