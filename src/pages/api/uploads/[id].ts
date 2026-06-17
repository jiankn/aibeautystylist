import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { apiError, apiSuccess } from "../../../lib/http";
import { getRuntimeBindings } from "../../../lib/runtime";
import { deleteOwnedUpload, getOwnedUpload } from "../../../lib/uploadRecords";

export const GET: APIRoute = async ({ cookies, params }) => {
  const uploadId = params.id;
  if (!uploadId) return uploadNotFound();

  const bindings = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, bindings.DB);
  if (!auth.ok) return auth.response;

  const upload = await getOwnedUpload(auth.user.id, uploadId, bindings.DB);
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
  if (!auth.ok) return auth.response;

  try {
    const result = await deleteOwnedUpload(
      auth.user.id,
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
