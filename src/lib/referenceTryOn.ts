import { TRYON_JOB_TIMEOUT_MS } from "./jobs";

export const REFERENCE_TRYON_POLL_INTERVAL_MS = 2_000;

// Keep foreground polling beyond the authoritative server timeout. The server
// remains the only source allowed to declare timeout and refund completion.
export const REFERENCE_TRYON_POLL_MAX_ATTEMPTS =
  Math.ceil(TRYON_JOB_TIMEOUT_MS / REFERENCE_TRYON_POLL_INTERVAL_MS) + 30;

export const REFERENCE_TRYON_POLL_WINDOW_MS =
  REFERENCE_TRYON_POLL_INTERVAL_MS * REFERENCE_TRYON_POLL_MAX_ATTEMPTS;
