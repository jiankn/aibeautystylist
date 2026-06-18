import type { LookCatalogItem } from "../data/lookCatalog";
import type { ResolvedLook } from "../data/makeup/audienceTypes";
import type { TryOnJobPurpose } from "./jobs";

export interface TryOnJobQueueMessage {
  version: 1;
  userId: string;
  jobId: string;
  look: LookCatalogItem | ResolvedLook;
  locale?: string;
  purpose?: TryOnJobPurpose;
  enqueuedAt: string;
}

export function isTryOnJobQueueMessage(
  value: unknown,
): value is TryOnJobQueueMessage {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TryOnJobQueueMessage>;
  return (
    candidate.version === 1 &&
    typeof candidate.userId === "string" &&
    candidate.userId.length > 0 &&
    typeof candidate.jobId === "string" &&
    candidate.jobId.length > 0 &&
    isQueueLook(candidate.look) &&
    (candidate.locale === undefined || typeof candidate.locale === "string") &&
    (candidate.purpose === undefined ||
      candidate.purpose === "tryon" ||
      candidate.purpose === "diagnosis") &&
    typeof candidate.enqueuedAt === "string"
  );
}

function isQueueLook(value: unknown): value is LookCatalogItem | ResolvedLook {
  if (!value || typeof value !== "object") return false;
  const look = value as Partial<LookCatalogItem | ResolvedLook>;
  return (
    typeof look.slug === "string" &&
    look.slug.length > 0 &&
    typeof look.title === "string" &&
    look.title.length > 0
  );
}
