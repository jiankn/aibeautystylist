import type { APIRoute } from "astro";

import { getAccountByUserId, setAccountAvatar } from "../../../lib/accounts";
import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { apiError, apiSuccess } from "../../../lib/http";
import { getRuntimeBindings } from "../../../lib/runtime";
import { validateImageUpload } from "../../../lib/uploads";

const AVATAR_SIZE = 256;
const MAX_AVATAR_BYTES = 512 * 1024;

export const GET: APIRoute = async ({ cookies }) => {
  const { DB, USER_UPLOADS } = getRuntimeBindings();
  if (!DB || !USER_UPLOADS) return avatarUnavailable();

  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;

  const account = await getAccountByUserId(auth.user.id, DB);
  if (!account?.avatarR2Key) return avatarNotFound();

  const object = await USER_UPLOADS.get(account.avatarR2Key).catch(() => null);
  if (!object) return avatarNotFound();

  return new Response(object.body as BodyInit, {
    headers: {
      "cache-control": "private, max-age=31536000, immutable",
      "content-type": "image/webp",
      "x-content-type-options": "nosniff",
    },
  });
};

export const PUT: APIRoute = async ({ cookies, request }) => {
  const { DB, USER_UPLOADS } = getRuntimeBindings();
  if (!DB || !USER_UPLOADS) return avatarUnavailable();

  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;

  const form = await request.formData().catch(() => null);
  const file = form?.get("avatar");
  if (!(file instanceof File)) {
    return apiError(
      {
        code: "MISSING_AVATAR",
        message: "请选择头像图片",
        retryable: false,
      },
      422,
    );
  }
  if (file.type !== "image/webp" || file.size > MAX_AVATAR_BYTES) {
    return invalidAvatar();
  }

  const image = await validateImageUpload(file).catch(() => null);
  if (
    !image ||
    image.contentType !== "image/webp" ||
    image.width !== AVATAR_SIZE ||
    image.height !== AVATAR_SIZE
  ) {
    return invalidAvatar();
  }

  const previous = await getAccountByUserId(auth.user.id, DB);
  if (!previous) {
    return apiError(
      {
        code: "ACCOUNT_NOT_FOUND",
        message: "没有找到当前账户",
        retryable: false,
      },
      404,
    );
  }

  const objectKey = `profile-avatars/${auth.user.id}/${crypto.randomUUID()}.webp`;
  await USER_UPLOADS.put(objectKey, image.bytes, {
    httpMetadata: { contentType: "image/webp" },
    customMetadata: {
      userId: auth.user.id,
      purpose: "profile-avatar",
    },
  });

  let updatedAt: string;
  try {
    updatedAt = await setAccountAvatar(auth.user.id, objectKey, DB);
  } catch (error) {
    await USER_UPLOADS.delete(objectKey).catch(() => undefined);
    throw error;
  }

  if (previous.avatarR2Key && previous.avatarR2Key !== objectKey) {
    await USER_UPLOADS.delete(previous.avatarR2Key).catch(() => undefined);
  }

  return apiSuccess({
    avatarUrl: `/api/profile/avatar?v=${encodeURIComponent(updatedAt)}`,
    contentType: "image/webp",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  });
};

function invalidAvatar(): Response {
  return apiError(
    {
      code: "INVALID_AVATAR",
      message: "头像必须是 256×256、512 KB 以内的 WebP 图片",
      retryable: false,
    },
    422,
  );
}

function avatarNotFound(): Response {
  return apiError(
    {
      code: "AVATAR_NOT_FOUND",
      message: "尚未设置头像",
      retryable: false,
    },
    404,
  );
}

function avatarUnavailable(): Response {
  return apiError(
    {
      code: "AVATAR_STORAGE_UNAVAILABLE",
      message: "头像服务暂不可用",
      retryable: true,
    },
    503,
  );
}
