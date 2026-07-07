import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { apiError, apiSuccess } from "../../../lib/http";
import { resolvePinterestGuestUploadOwner } from "../../../lib/pinterestGuestPass";
import { getRuntimeBindings } from "../../../lib/runtime";
import { deleteOwnedUpload, getOwnedUpload } from "../../../lib/uploadRecords";

export const GET: APIRoute = async ({ cookies, params }) => {
  const uploadId = params.id;
  if (!uploadId) return uploadNotFound();

  const bindings = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, bindings.DB);
  const guestPass = auth.ok
    ? undefined
    : await resolvePinterestGuestUploadOwner(cookies, uploadId, bindings.DB);
  if (!auth.ok && !guestPass) return auth.response;
  const userId = auth.ok ? auth.user.id : guestPass?.guestUserId;
  if (!userId) {
    return apiError(
      {
        code: "AUTH_REQUIRED",
        message: "Please sign in before continuing.",
        retryable: false,
      },
      401,
    );
  }

  const upload = await getOwnedUpload(userId, uploadId, bindings.DB);
  if (!upload || upload.deletedAt) return uploadNotFound();

  return apiSuccess({
    id: upload.id,
    status: upload.status,
    storage: upload.r2Key ? "private-r2" : "mock-no-storage",
    contentType: upload.contentType,
    sizeBytes: upload.sizeBytes,
    width: upload.width,
    height: upload.height,
    orientation: upload.orientation,
    deleteAfter: upload.deleteAfter,
    createdAt: upload.createdAt,
  });
};

export const DELETE: APIRoute = async ({ cookies, params }) => {
  const uploadId = params.id;
  if (!uploadId) return uploadNotFound();

  const bindings = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, bindings.DB);
  const guestPass = auth.ok
    ? undefined
    : await resolvePinterestGuestUploadOwner(cookies, uploadId, bindings.DB);
  if (!auth.ok && !guestPass) return auth.response;
  const userId = auth.ok ? auth.user.id : guestPass?.guestUserId;
  if (!userId) {
    return apiError(
      {
        code: "AUTH_REQUIRED",
        message: "Please sign in before continuing.",
        retryable: false,
      },
      401,
    );
  }

  try {
    const result = await deleteOwnedUpload(
      userId,
      uploadId,
      bindings.DB,
      bindings.USER_UPLOADS,
    );
    if (!result) return uploadNotFound();

    return apiSuccess({
      id: result.upload.id,
      status: result.upload.status,
      alreadyDeleted: result.alreadyDeleted,
      deletedAt: result.upload.deletedAt,
    });
  } catch {
    return apiError(
      {
        code: "UPLOAD_DELETE_FAILED",
        message: "原始自拍删除失败，请稍后重试",
        retryable: true,
      },
      503,
    );
  }
};

function uploadNotFound(): Response {
  return apiError(
    {
      code: "UPLOAD_NOT_FOUND",
      message: "上传记录不存在或已删除",
      retryable: false,
    },
    404,
  );
}
