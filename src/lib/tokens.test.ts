import { describe, expect, it } from "vitest";

import { generateToken, hashToken } from "./tokens";

describe("tokens", () => {
  it("generates unique high-entropy url-safe tokens", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(a.length).toBeGreaterThanOrEqual(40);
  });

  it("hashes a token deterministically", async () => {
    const token = "example-token";
    const first = await hashToken(token);
    const second = await hashToken(token);
    expect(first).toBe(second);
    expect(first).toMatch(/^[0-9a-f]{64}$/);
    expect(first).not.toContain(token);
  });
});
