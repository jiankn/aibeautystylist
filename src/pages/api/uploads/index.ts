import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { apiError, apiSuccess } from "../../../lib/http";
import { getRuntimeBindings } from "../../../lib/runtime";
import { saveUploadRecord } from "../../../lib/uploadRecords";
import {
  getDeleteAfter,
  PHOTO_CONSENT_VERSION,
  validateImageUpload,
} from "../../../lib/uploads";

const UPLOAD_FIELD = "photo";

export const POST: APIRoute = async ({ cookies, request }) => {
  const bindings = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, bindings.DB);
  if (!auth.ok) return auth.response;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get(UPLOAD_FIELD);
  const consentVersion = formData?.get("consentVersion");
  if (!(file instanceof File)) {
    return apiError(
      {
        code: "UPLOAD_REQUIRED",
        message: "请选择要上传的自拍照片",
        retryable: false,
      },
      422,
    );
  }
  if (consentVersion !== PHOTO_CONSENT_VERSION) {
    return apiError(
      {
        code: "CONSENT_REQUIRED",
        message: "上传前请先确认照片处理说明",
        retryable: false,
      },
      409,
    );
  }

  let image: Awaited<ReturnType<typeof validateImageUpload>>;
  try {
    image = await validateImageUpload(file);
  } catch (error) {
    return apiError(
      {
        code: error instanceof Error ? error.message : "INVALID_IMAGE",
        message: "照片格式或内容无法识别，请上传 JPG、PNG、WebP 或 HEIC/HEIF 图片",
        retryable: false,
      },
      422,
    );
  }

  const now = new Date();
  const uploadId = crypto.randomUUID();
  const shouldStoreInR2 = bindings.UPLOAD_PROVIDER === "r2";
  if (shouldStoreInR2 && !bindings.USER_UPLOADS) {
    return apiError(
      {
        code: "R2_UNAVAILABLE",
        message: "上传存储暂不可用，请稍后重试",
        retryable: true,
      },
      503,
    );
  }

  const r2Key = shouldStoreInR2
    ? `originals/${auth.user.id}/${uploadId}/original.${image.extension}`
    : undefined;

  const upload = {
    id: uploadId,
    userId: auth.user.id,
    r2Key,
    status: r2Key ? "stored" : "validated",
    contentType: image.contentType,
    sizeBytes: file.size,
    width: image.width,
    height: image.height,
    orientation: image.orientation,
    deleteAfter: getDeleteAfter(now),
    createdAt: now.toISOString(),
  } as const;
  try {
    if (r2Key && bindings.USER_UPLOADS) {
      await bindings.USER_UPLOADS.put(r2Key, image.bytes, {
        httpMetadata: { contentType: image.contentType },
        customMetadata: {
          uploadId,
          userId: auth.user.id,
        },
      });
    }
    await saveUploadRecord(upload, bindings.DB);
  } catch {
    return apiError(
      {
        code: "UPLOAD_STORE_FAILED",
        message: "照片保存失败，请稍后重试",
        retryable: true,
      },
      503,
    );
  }

  return apiSuccess(
    {
      id: upload.id,
      status: upload.status,
      storage: r2Key ? "private-r2" : "mock-no-storage",
      contentType: upload.contentType,
      sizeBytes: upload.sizeBytes,
      width: upload.width,
      height: upload.height,
      orientation: upload.orientation,
      deleteAfter: upload.deleteAfter,
      createdAt: upload.createdAt,
    },
    { status: 201 },
  );
};
