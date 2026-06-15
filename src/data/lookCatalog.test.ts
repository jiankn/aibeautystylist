import { describe, expect, it } from "vitest";

import { lookCatalog } from "./lookCatalog";

describe("lookCatalog", () => {
  it("contains all 44 active look images", () => {
    expect(lookCatalog).toHaveLength(44);
  });

  it("uses unique stable slugs and image paths", () => {
    expect(new Set(lookCatalog.map((item) => item.slug)).size).toBe(
      lookCatalog.length,
    );
    expect(new Set(lookCatalog.map((item) => item.image)).size).toBe(
      lookCatalog.length,
    );
  });

  it("contains complete Chinese display metadata", () => {
    for (const item of lookCatalog) {
      expect(item.title.length).toBeGreaterThan(2);
      expect(item.imageAlt).toContain(item.title);
      expect(item.scenarios.length).toBeGreaterThan(0);
      expect(item.finish.length).toBeGreaterThan(0);
      expect(item.intent.length).toBeGreaterThan(10);
    }
  });
});
