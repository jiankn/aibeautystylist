import type { LookCatalogItem } from "../data/lookCatalog";
import {
  MAKEUP_REFERENCE_SPEC_VERSION,
  parseMakeupReferenceSpec,
  type MakeupReferenceSpec,
} from "./makeupTransfer";
import type { D1DatabaseLike, R2BucketLike } from "./runtime";

export const PRIVATE_TEMPLATE_LIMIT = 30;

export interface PrivateLookTemplate {
  id: string;
  userId: string;
  title: string;
  r2Key: string;
  contentType: string;
  sizeBytes: number;
  width: number;
  height: number;
  status: "active" | "deleted";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  referenceSha256?: string;
  makeupSpecStatus?: "pending" | "ready" | "failed";
  makeupSpecVersion?: string;
  makeupSpec?: MakeupReferenceSpec;
}

interface PrivateLookTemplateRow {
  id: string;
  user_id: string;
  title: string;
  r2_key: string;
  content_type: string;
  size_bytes: number;
  width: number;
  height: number;
  status: PrivateLookTemplate["status"];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  reference_sha256: string | null;
  makeup_spec_status: string | null;
  makeup_spec_version: string | null;
  makeup_spec_json: string | null;
}

const mockTemplates = new Map<string, PrivateLookTemplate>();

export async function countActivePrivateLookTemplates(
  userId: string,
  DB?: D1DatabaseLike,
): Promise<number> {
  if (DB) {
    const row = await DB.prepare(
      "SELECT COUNT(*) AS count FROM private_look_templates WHERE user_id = ? AND status = 'active' AND deleted_at IS NULL",
    )
      .bind(userId)
      .first<{ count: number }>();
    return Number(row?.count ?? 0);
  }
  return [...mockTemplates.values()].filter(
    (template) =>
      template.userId === userId &&
      template.status === "active" &&
      !template.deletedAt,
  ).length;
}

export async function savePrivateLookTemplate(
  template: PrivateLookTemplate,
  DB?: D1DatabaseLike,
): Promise<void> {
  if (DB) {
    await DB.prepare(
      `INSERT INTO private_look_templates
       (id, user_id, title, r2_key, content_type, size_bytes, width, height, status, created_at, updated_at, deleted_at, reference_sha256, makeup_spec_status, makeup_spec_version, makeup_spec_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        template.id,
        template.userId,
        template.title,
        template.r2Key,
        template.contentType,
        template.sizeBytes,
        template.width,
        template.height,
        template.status,
        template.createdAt,
        template.updatedAt,
        template.deletedAt ?? null,
        template.referenceSha256 ?? null,
        template.makeupSpecStatus ?? "pending",
        template.makeupSpecVersion ?? null,
        template.makeupSpec ? JSON.stringify(template.makeupSpec) : null,
      )
      .run();
    return;
  }
  mockTemplates.set(template.id, template);
}

export async function listOwnedPrivateLookTemplates(
  userId: string,
  DB?: D1DatabaseLike,
  limit = PRIVATE_TEMPLATE_LIMIT,
): Promise<PrivateLookTemplate[]> {
  if (DB) {
    const rows = await DB.prepare(
      `SELECT id, user_id, title, r2_key, content_type, size_bytes, width, height, status, created_at, updated_at, deleted_at, reference_sha256, makeup_spec_status, makeup_spec_version, makeup_spec_json
       FROM private_look_templates
       WHERE user_id = ? AND status = 'active' AND deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT ?`,
    )
      .bind(userId, limit)
      .all<PrivateLookTemplateRow>();
    return (rows.results ?? []).map(fromRow);
  }
  return [...mockTemplates.values()]
    .filter(
      (template) =>
        template.userId === userId &&
        template.status === "active" &&
        !template.deletedAt,
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function getOwnedPrivateLookTemplate(
  userId: string,
  templateId: string,
  DB?: D1DatabaseLike,
): Promise<PrivateLookTemplate | undefined> {
  if (DB) {
    const row = await DB.prepare(
      `SELECT id, user_id, title, r2_key, content_type, size_bytes, width, height, status, created_at, updated_at, deleted_at, reference_sha256, makeup_spec_status, makeup_spec_version, makeup_spec_json
       FROM private_look_templates
       WHERE id = ? AND user_id = ? AND status = 'active' AND deleted_at IS NULL`,
    )
      .bind(templateId, userId)
      .first<PrivateLookTemplateRow>();
    return row ? fromRow(row) : undefined;
  }
  const template = mockTemplates.get(templateId);
  return template?.userId === userId &&
    template.status === "active" &&
    !template.deletedAt
    ? template
    : undefined;
}

export async function deleteOwnedPrivateLookTemplate(
  userId: string,
  templateId: string,
  DB?: D1DatabaseLike,
  bucket?: R2BucketLike,
  now = new Date(),
): Promise<PrivateLookTemplate | undefined> {
  const template = await getOwnedPrivateLookTemplate(userId, templateId, DB);
  if (!template) return undefined;
  if (!bucket) throw new Error("R2_BINDING_UNAVAILABLE");

  const deletedAt = now.toISOString();
  await bucket.delete(template.r2Key);

  if (DB) {
    await DB.prepare(
      `UPDATE private_look_templates
       SET status = 'deleted', r2_key = '', reference_sha256 = NULL, makeup_spec_status = 'pending', makeup_spec_version = NULL, makeup_spec_json = NULL, deleted_at = ?, updated_at = ?
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
    )
      .bind(deletedAt, deletedAt, templateId, userId)
      .run();
    await DB.prepare(
      `INSERT INTO deletion_audit_records
       (id, user_id, resource_type, resource_id, r2_key, actor, status, error_code, created_at)
       VALUES (?, ?, 'private_look_template', ?, ?, 'user', 'succeeded', NULL, ?)`,
    )
      .bind(crypto.randomUUID(), userId, templateId, template.r2Key, deletedAt)
      .run();
  } else {
    mockTemplates.set(templateId, {
      ...template,
      r2Key: "",
      status: "deleted",
      deletedAt,
      updatedAt: deletedAt,
      referenceSha256: undefined,
      makeupSpecStatus: "pending",
      makeupSpecVersion: undefined,
      makeupSpec: undefined,
    });
  }

  return {
    ...template,
    status: "deleted",
    deletedAt,
    updatedAt: deletedAt,
    referenceSha256: undefined,
    makeupSpecStatus: "pending",
    makeupSpecVersion: undefined,
    makeupSpec: undefined,
  };
}

export async function updatePrivateLookTemplateMakeupSpec(
  userId: string,
  templateId: string,
  update: {
    status: "ready" | "failed";
    referenceSha256: string;
    spec?: MakeupReferenceSpec;
  },
  DB?: D1DatabaseLike,
  now = new Date(),
): Promise<void> {
  const updatedAt = now.toISOString();
  const specVersion = update.spec ? MAKEUP_REFERENCE_SPEC_VERSION : undefined;
  if (DB) {
    await DB.prepare(
      `UPDATE private_look_templates
       SET reference_sha256 = ?, makeup_spec_status = ?, makeup_spec_version = ?, makeup_spec_json = ?, updated_at = ?
       WHERE id = ? AND user_id = ? AND status = 'active' AND deleted_at IS NULL`,
    )
      .bind(
        update.referenceSha256,
        update.status,
        specVersion ?? null,
        update.spec ? JSON.stringify(update.spec) : null,
        updatedAt,
        templateId,
        userId,
      )
      .run();
    return;
  }

  const template = mockTemplates.get(templateId);
  if (
    !template ||
    template.userId !== userId ||
    template.status !== "active" ||
    template.deletedAt
  ) {
    return;
  }
  mockTemplates.set(templateId, {
    ...template,
    referenceSha256: update.referenceSha256,
    makeupSpecStatus: update.status,
    makeupSpecVersion: specVersion,
    makeupSpec: update.spec,
    updatedAt,
  });
}

export function privateTemplateToLook(
  template: Pick<PrivateLookTemplate, "id" | "title">,
): LookCatalogItem {
  return {
    slug: `private-${template.id}`,
    title: template.title,
    image: `/api/private-look-templates/${encodeURIComponent(template.id)}/image`,
    imageAlt: `${template.title} private makeup reference`,
    scenarios: ["日常"],
    finish: ["参考图复刻"],
    experience: "进阶",
    intent:
      "Transfer the makeup design from the private reference image onto the user's selfie.",
    advisor: {
      fit: "Adapt the referenced makeup placement to the user's visible facial proportions.",
      effect:
        "Preserve identity while transferring makeup color, placement, and finish.",
      anchors: ["reference makeup", "identity preservation"],
      caution:
        "Do not copy the reference person's identity, hair, clothing, or background.",
      judge: [
        "makeup similarity",
        "identity preservation",
        "natural skin texture",
      ],
    },
  };
}

export function resetMockPrivateLookTemplates(): void {
  mockTemplates.clear();
}

function fromRow(row: PrivateLookTemplateRow): PrivateLookTemplate {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    r2Key: row.r2_key,
    contentType: row.content_type,
    sizeBytes: Number(row.size_bytes),
    width: Number(row.width),
    height: Number(row.height),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined,
    referenceSha256: row.reference_sha256 ?? undefined,
    makeupSpecStatus: normalizeMakeupSpecStatus(row.makeup_spec_status),
    makeupSpecVersion: row.makeup_spec_version ?? undefined,
    makeupSpec: parseStoredMakeupSpec(row.makeup_spec_json),
  };
}

function normalizeMakeupSpecStatus(
  value: string | null,
): PrivateLookTemplate["makeupSpecStatus"] {
  return value === "ready" || value === "failed" ? value : "pending";
}

function parseStoredMakeupSpec(
  value: string | null,
): MakeupReferenceSpec | undefined {
  if (!value) return undefined;
  try {
    return parseMakeupReferenceSpec(JSON.parse(value));
  } catch {
    return undefined;
  }
}
