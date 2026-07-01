import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  countActivePrivateLookTemplates,
  deleteOwnedPrivateLookTemplate,
  getOwnedPrivateLookTemplate,
  listOwnedPrivateLookTemplates,
  privateTemplateToLook,
  resetMockPrivateLookTemplates,
  savePrivateLookTemplate,
  updatePrivateLookTemplateMakeupSpec,
  type PrivateLookTemplate,
} from "./privateLookTemplates";

const template: PrivateLookTemplate = {
  id: "template_1",
  userId: "user_1",
  title: "Soft plum reference",
  r2Key: "private-templates/user_1/template_1/reference.webp",
  contentType: "image/webp",
  sizeBytes: 1024,
  width: 900,
  height: 1200,
  status: "active",
  createdAt: "2026-06-30T00:00:00.000Z",
  updatedAt: "2026-06-30T00:00:00.000Z",
};

describe("private look templates", () => {
  beforeEach(() => resetMockPrivateLookTemplates());

  it("lists and reads only the owner's active templates", async () => {
    await savePrivateLookTemplate(template);

    await expect(countActivePrivateLookTemplates("user_1")).resolves.toBe(1);
    await expect(listOwnedPrivateLookTemplates("user_1")).resolves.toEqual([
      template,
    ]);
    await expect(
      getOwnedPrivateLookTemplate("user_2", template.id),
    ).resolves.toBeUndefined();
  });

  it("deletes the private object and makes the template inaccessible", async () => {
    const bucket = {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(async () => undefined),
    };
    await savePrivateLookTemplate(template);

    const deleted = await deleteOwnedPrivateLookTemplate(
      "user_1",
      template.id,
      undefined,
      bucket,
      new Date("2026-06-30T01:00:00.000Z"),
    );

    expect(bucket.delete).toHaveBeenCalledWith(template.r2Key);
    expect(deleted).toMatchObject({ status: "deleted" });
    await expect(
      getOwnedPrivateLookTemplate("user_1", template.id),
    ).resolves.toBeUndefined();
  });

  it("creates an owner-authenticated synthetic look without exposing an R2 key", () => {
    const look = privateTemplateToLook(template);

    expect(look).toMatchObject({
      slug: "private-template_1",
      title: template.title,
      image: "/api/private-look-templates/template_1/image",
    });
    expect(JSON.stringify(look)).not.toContain(template.r2Key);
  });

  it("caches the structured makeup specification for later reuse", async () => {
    await savePrivateLookTemplate(template);
    const area = {
      colors: ["silver"],
      placement: ["mobile lid"],
      finish: ["wet-look"],
      intensity: "strong" as const,
    };
    await updatePrivateLookTemplateMakeupSpec("user_1", template.id, {
      status: "ready",
      referenceSha256: "abc123",
      spec: {
        schemaVersion: "1.0.0",
        summary: "Reflective silver lid",
        focalAreas: ["eyes"],
        base: area,
        eyes: area,
        brows: area,
        cheeks: area,
        lips: area,
        contourHighlight: area,
        mustMatch: ["wet-look lid"],
        mustAvoid: ["matte brown shadow"],
      },
    });

    await expect(
      getOwnedPrivateLookTemplate("user_1", template.id),
    ).resolves.toMatchObject({
      referenceSha256: "abc123",
      makeupSpecStatus: "ready",
      makeupSpecVersion: "1.0.0",
      makeupSpec: { summary: "Reflective silver lid" },
    });
  });
});
