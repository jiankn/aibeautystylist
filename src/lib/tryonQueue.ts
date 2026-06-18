import type { LookCatalogItem } from "../data/lookCatalog";
import type { ResolvedLook } from "../data/makeup/audienceTypes";
import type { TryOnJobPurpose } from "./jobs";
import type { RuntimeBindings } from "./runtime";
import {
  isTryOnJobQueueMessage,
  type TryOnJobQueueMessage,
} from "./tryonJobQueueTypes";
import { processTryOnJob } from "./tryonJobService";

export interface EnqueueTryOnJobOptions {
  userId: string;
  jobId: string;
  look: LookCatalogItem | ResolvedLook;
  bindings: RuntimeBindings;
  locale?: string;
  purpose?: TryOnJobPurpose;
}

export async function enqueueTryOnJob(
  options: EnqueueTryOnJobOptions,
): Promise<boolean> {
  if (!options.bindings.TRYON_JOBS_QUEUE) return false;

  await options.bindings.TRYON_JOBS_QUEUE.send({
    version: 1,
    userId: options.userId,
    jobId: options.jobId,
    look: options.look,
    locale: options.locale,
    purpose: options.purpose,
    enqueuedAt: new Date().toISOString(),
  });
  return true;
}

export async function processTryOnJobQueueMessage(
  message: unknown,
  bindings: RuntimeBindings,
): Promise<void> {
  if (!isTryOnJobQueueMessage(message)) {
    throw new Error("INVALID_TRYON_QUEUE_MESSAGE");
  }

  await processTryOnJob({
    userId: message.userId,
    jobId: message.jobId,
    look: message.look,
    bindings,
    audienceContext: { locale: message.locale },
  });
}

export type { TryOnJobQueueMessage };
