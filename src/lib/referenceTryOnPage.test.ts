import { describe, expect, it } from "vitest";

import pageSource from "../pages/reference-tryon.astro?raw";

describe("reference try-on launch contracts", () => {
  it("preserves user intent through upgrade checkout", () => {
    expect(pageSource).toContain("return_to=${encodeURIComponent(pageHref)}");
    expect(pageSource).toContain('<SiteHeader active="tryOn" />');
  });

  it("registers long-running generation as a background task", () => {
    expect(pageSource).toContain("function upsertBackgroundTask");
    expect(pageSource).toContain('new CustomEvent("abs:background-task"');
    expect(pageSource).toContain("return { id: jobId, pending: true }");
  });

  it("only claims a refund after a terminal server status", () => {
    expect(pageSource).toContain("function terminalJobError(job)");
    expect(pageSource).toContain('job.status === "timed_out"');
    expect(pageSource).not.toContain("throw new Error(copy.failed)");
  });

  it("requires two credits and refreshes quota from server responses", () => {
    expect(pageSource).toContain("PRIVATE_REFERENCE_TRYON_CREDIT_COST");
    expect(pageSource).toContain("Uses 2 generation credits");
    expect(pageSource).toContain("if (job.quota) updateQuota(job.quota)");
  });

  it("keeps validation and recovery feedback accessible", () => {
    expect(pageSource).toContain('data-error="reference"');
    expect(pageSource).toContain('data-error="selfie"');
    expect(pageSource).toContain("focusField(failures[0][0])");
    expect(pageSource).toContain("data-loading-retry");
    expect(pageSource).toContain("window.absConfirm(copy.deleteConfirm");
  });

  it("uses defined theme tokens and disables reduced-motion animation", () => {
    expect(pageSource).not.toContain("--gold-deep");
    expect(pageSource).not.toContain("--gold-pale");
    expect(pageSource).toContain("animation: none");
  });
});
