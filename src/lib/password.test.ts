import { describe, expect, it } from "vitest";

import {
  hashPassword,
  validatePasswordStrength,
  verifyPassword,
} from "./password";

describe("password", () => {
  it("accepts strong passwords and rejects weak ones", () => {
    expect(validatePasswordStrength("abc12345")).toBe(true);
    expect(validatePasswordStrength("short1")).toBe(false);
    expect(validatePasswordStrength("allletters")).toBe(false);
    expect(validatePasswordStrength("12345678")).toBe(false);
  });

  it("hashes and verifies the same password", async () => {
    const stored = await hashPassword("Sunflower9");
    await expect(verifyPassword("Sunflower9", stored)).resolves.toBe(true);
    await expect(verifyPassword("Sunflower8", stored)).resolves.toBe(false);
  });

  it("uses a random salt per hash", async () => {
    const a = await hashPassword("Sunflower9");
    const b = await hashPassword("Sunflower9");
    expect(a.salt).not.toBe(b.salt);
    expect(a.hash).not.toBe(b.hash);
  });
});
