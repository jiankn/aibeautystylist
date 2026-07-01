import type { APIRoute } from "astro";

import { apiError, apiSuccess } from "../../../../lib/http";
import { cleanupExpiredRejectedTryOnCandidates } from "../../../../lib/rejectedTryOnCandidates";
import { getRuntimeBindings } from "../../../../lib/runtime";
import { cleanupExpiredUploads } from "../../../../lib/uploadRecords";

export const POST: APIRoute = async ({ request }) => {
  const { CLEANUP_SECRET, DB, USER_UPLOADS } = getRuntimeBindings();
  if (!CLEANUP_SECRET) {
    return apiError(
      {
        code: "CLEANUP_NOT_CONFIGURED",
        message: "清理任务尚未配置",
        retryable: false,
      },
      503,
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${CLEANUP_SECRET}`) {
    return apiError(
      {
        code: "FORBIDDEN",
        message: "无权执行清理任务",
        retryable: false,
      },
      403,
    );
  }
  if (!DB) {
    return apiError(
      {
        code: "CLEANUP_NOT_CONFIGURED",
        message: "数据库绑定不可用",
        retryable: true,
      },
      503,
    );
  }

  const uploads = await cleanupExpiredUploads(DB, USER_UPLOADS);
  const rejectedTryOnCandidates = await cleanupExpiredRejectedTryOnCandidates(
    DB,
    USER_UPLOADS,
  );

  return apiSuccess({
    ...uploads,
    rejectedTryOnCandidates,
  });
};
