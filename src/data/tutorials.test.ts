import { describe, expect, it } from "vitest";
import { appLocaleCodes } from "../i18n/config";
import { getTutorialByLookSlug, getTutorialUiCopy } from "./tutorials";

describe("localized tutorials", () => {
  it.each(appLocaleCodes)(
    "provides complete tutorial UI copy for %s",
    (locale) => {
      const copy = getTutorialUiCopy(locale);

      expect(copy.ariaLabel).toBeTruthy();
      expect(copy.regions.base).toBeTruthy();
      expect(copy.difficulties.beginner).toBeTruthy();
      expect(copy.estimatedMinutes).toContain("{minutes}");
      expect(copy.stepCount).toContain("{count}");
      expect(copy.remainingSteps).toContain("{count}");
    },
  );

  it.each(appLocaleCodes)(
    "provides both complete tutorials for %s",
    (locale) => {
      for (const lookSlug of ["commute", "no-makeup"] as const) {
        const tutorial = getTutorialByLookSlug(lookSlug, locale);

        expect(tutorial).toBeDefined();
        expect(tutorial?.title).toBeTruthy();
        expect(tutorial?.description).toBeTruthy();
        expect(tutorial?.steps).toHaveLength(6);
        expect(
          tutorial?.steps.every(
            (step) => step.title && step.tool && step.action && step.region,
          ),
        ).toBe(true);
      }
    },
  );

  it("returns no tutorial for unsupported looks", () => {
    expect(getTutorialByLookSlug("unknown", "en")).toBeUndefined();
  });
});
