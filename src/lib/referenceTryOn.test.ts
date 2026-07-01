import { describe, expect, it } from "vitest";

import { TRYON_JOB_TIMEOUT_MS } from "./jobs";
import {
  REFERENCE_TRYON_POLL_INTERVAL_MS,
  REFERENCE_TRYON_POLL_MAX_ATTEMPTS,
  REFERENCE_TRYON_POLL_WINDOW_MS,
} from "./referenceTryOn";

describe("reference try-on polling", () => {
  it("keeps polling beyond the authoritative server timeout", () => {
    expect(REFERENCE_TRYON_POLL_INTERVAL_MS).toBe(2_000);
    expect(REFERENCE_TRYON_POLL_MAX_ATTEMPTS).toBeGreaterThan(0);
    expect(REFERENCE_TRYON_POLL_WINDOW_MS).toBeGreaterThan(
      TRYON_JOB_TIMEOUT_MS,
    );
  });
});
