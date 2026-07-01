import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { requireFeature } from "../../../lib/entitlements";
import { apiError, apiSuccess } from "../../../lib/http";
import {
  countActivePrivateLookTemplates,
  listOwnedPrivateLookTemplates,
  PRIVATE_TEMPLATE_LIMIT,
  savePrivateLookTemplate,
} from "../../../lib/privateLookTemplates";
import { getRuntimeBindings } from "../../../lib/runtime";
import { validateImageUpload } from "../../../lib/uploads";

const MAX_REFERENCE_BYTES = 4 * 1024 * 1024;

export const GET: APIRoute = async ({ cookies }) => {
  const { DB } = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;

  const items = await listOwnedPrivateLookTemplates(auth.user.id, DB);
  return apiSuccess({
    items: items.map(toResponse),
    limit: PRIVATE_TEMPLATE_LIMIT,
  });
};

export const POST: APIRoute = async ({ cookies, request }) => {
  const { DB, USER_UPLOADS, UPLOAD_PROVIDER } = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;

  const entitlement = await requireFeature(
    auth.user.id,
    "privateReferenceTryOn",
    DB,
  );
  if (!entitlement.allowed) return premiumRequired();
  if (!DB || UPLOAD_PROVIDER !== "r2" || !USER_UPLOADS) {
    return apiError(
      {
        code: "PRIVATE_STORAGE_UNAVAILABLE",
        message: "私有参考图存储暂不可用，请稍后重试",
        retryable: true,
      },
      503,
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("reference");
  const rightsAccepted = formData?.get("rightsAccepted");
  const requestedTitle = String(formData?.get("title") ?? "").trim();
  if (!(file instanceof File)) {
    return apiError(
      {
        code: "REFERENCE_REQUIRED",
        message: "请选择一张妆容参考图",
        retryable: false,
      },
      422,
    );
  }
  if (rightsAccepted !== "true") {
    return apiError(
      {
        code: "REFERENCE_RIGHTS_REQUIRED",
        message: "请确认你有权将该图片用于私有试妆",
        retryable: false,
      },
      409,
    );
  }
  if (file.type !== "image/webp" || file.size > MAX_REFERENCE_BYTES) {
    return apiError(
      {
        code: "REFERENCE_WEBP_REQUIRED",
        message: "参考图需要压缩为 4MB 以内的 WebP 图片",
        retryable: false,
      },
      422,
    );
  }

  let image: Awaited<ReturnType<typeof validateImageUpload>>;
  try {
    image = await validateImageUpload(file);
  } catch {
    return apiError(
      {
        code: "INVALID_REFERENCE_IMAGE",
        message: "参考图无法识别，请重新选择清晰的单人正脸妆容图",
        retryable: false,
      },
      422,
    );
  }

  const activeCount = await countActivePrivateLookTemplates(auth.user.id, DB);
  if (activeCount >= PRIVATE_TEMPLATE_LIMIT) {
    return apiError(
      {
        code: "PRIVATE_TEMPLATE_LIMIT_REACHED",
        message: `最多保存 ${PRIVATE_TEMPLATE_LIMIT} 个私有参考妆容，请先删除不再使用的模板`,
        retryable: false,
      },
      409,
    );
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const title = normalizeTitle(requestedTitle, activeCount + 1);
  const r2Key = `private-templates/${auth.user.id}/${id}/reference.webp`;
  const referenceSha256 = await sha256Hex(image.bytes);
  const template = {
    id,
    userId: auth.user.id,
    title,
    r2Key,
    contentType: "image/webp",
    sizeBytes: file.size,
    width: image.width,
    height: image.height,
    status: "active" as const,
    referenceSha256,
    makeupSpecStatus: "pending" as const,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await USER_UPLOADS.put(r2Key, image.bytes, {
      httpMetadata: { contentType: "image/webp" },
      customMetadata: {
        userId: auth.user.id,
        templateId: id,
        privacy: "owner-only",
      },
    });
    await savePrivateLookTemplate(template, DB);
  } catch {
    await USER_UPLOADS.delete(r2Key).catch(() => undefined);
    return apiError(
      {
        code: "PRIVATE_TEMPLATE_STORE_FAILED",
        message: "参考妆容保存失败，请稍后重试",
        retryable: true,
      },
      503,
    );
  }

  return apiSuccess(toResponse(template), { status: 201 });
};

function premiumRequired(): Response {
  return apiError(
    {
      code: "PREMIUM_REQUIRED",
      message: "上传参考妆容是 Premium 专属功能",
      retryable: false,
    },
    403,
  );
}

function normalizeTitle(value: string, fallbackNumber: number): string {
  const normalized = value.replace(/\s+/g, " ").slice(0, 60);
  return normalized || `我的参考妆容 ${fallbackNumber}`;
}

function toResponse(template: {
  id: string;
  title: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
  makeupSpecStatus?: "pending" | "ready" | "failed";
  makeupSpec?: {
    summary: string;
    focalAreas: string[];
  };
}) {
  return {
    id: template.id,
    title: template.title,
    width: template.width,
    height: template.height,
    image: `/api/private-look-templates/${encodeURIComponent(template.id)}/image`,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
    makeupSpecStatus: template.makeupSpecStatus ?? "pending",
    makeupSummary: template.makeupSpec?.summary,
    focalAreas: template.makeupSpec?.focalAreas ?? [],
  };
}

async function sha256Hex(value: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", value);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
