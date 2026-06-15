import type { APIRoute } from "astro";

import { recordPhotoConsent } from "../../../lib/consent";
import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { apiError, apiSuccess } from "../../../lib/http";
import { getRuntimeBindings } from "../../../lib/runtime";
import { PHOTO_CONSENT_VERSION } from "../../../lib/uploads";

export const POST: APIRoute = async ({ cookies, request }) => {
  const body = (await request.json().catch(() => null)) as {
    accepted?: boolean;
    version?: string;
  } | null;
  if (body?.accepted !== true || body?.version !== PHOTO_CONSENT_VERSION) {
    return apiError(
      {
        code: "CONSENT_REQUIRED",
        message: "上传前请先确认照片处理说明",
        retryable: false,
      },
      409,
    );
  }

  const { DB } = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;
  const userId = auth.user.id;
  return apiSuccess(
    await recordPhotoConsent(userId, PHOTO_CONSENT_VERSION, DB),
  );
};
