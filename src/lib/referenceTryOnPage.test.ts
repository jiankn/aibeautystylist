import { describe, expect, it } from "vitest";

import pageSource from "../pages/reference-tryon.astro?raw";
import historyPageSource from "../pages/history.astro?raw";
import jobsApiSource from "../pages/api/tryon-jobs/index.ts?raw";
import historyDrawerSource from "../components/ReferenceTryOnHistoryDrawer.astro?raw";
import workspaceSource from "../components/ReferenceTryOnWorkspace.astro?raw";
import copySource from "../data/referenceTryOnCopy.ts?raw";

const interfaceSource = `${pageSource}\n${workspaceSource}`;

describe("reference try-on launch contracts", () => {
  it("preserves user intent through upgrade checkout", () => {
    expect(pageSource).toContain("return_to=${encodeURIComponent(pageHref)}");
    expect(pageSource).toContain("<SiteHeader minimal />");
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
    expect(copySource).toContain("Uses 2 credits");
    expect(pageSource).toContain("if (job.quota) updateQuota(job.quota)");
  });

  it("keeps validation and recovery feedback accessible", () => {
    expect(interfaceSource).toContain('data-error="reference"');
    expect(interfaceSource).toContain('data-error="selfie"');
    expect(pageSource).toContain("focusField(failures[0][0])");
    expect(interfaceSource).toContain("data-loading-retry");
    expect(pageSource).toContain("window.absConfirm(copy.deleteConfirm");
  });

  it("uses defined theme tokens and disables reduced-motion animation", () => {
    expect(workspaceSource).not.toContain("--gold-deep");
    expect(workspaceSource).not.toContain("--gold-pale");
    expect(workspaceSource).toContain("animation: none");
    expect(workspaceSource).toContain('[data-theme="dark"]');
    expect(workspaceSource).toContain("data-compare-slider");
  });

  it("opens an accessible private-reference history drawer", () => {
    expect(pageSource).toContain("ReferenceTryOnHistoryDrawer");
    expect(interfaceSource).toContain("data-reference-history-trigger");
    expect(historyDrawerSource).toContain('role="dialog"');
    expect(historyDrawerSource).toContain('aria-modal="true"');
    expect(historyDrawerSource).toContain('event.key === "Escape"');
    expect(historyDrawerSource).toContain("env(safe-area-inset-bottom)");
  });

  it("ships localized workspace copy for all nine public locales", () => {
    expect(copySource).toContain("const en =");
    for (const locale of [
      "zh-CN",
      "zh-TW",
      "de-DE",
      "fr-FR",
      "ja-JP",
      "ko-KR",
      "es-ES",
      "pt-BR",
    ]) {
      expect(copySource).toContain(`"${locale}"`);
    }
    expect(pageSource).toContain("getReferenceTryOnCopy(locale)");
  });

  it("loads only completed private-reference history and supports reuse", () => {
    expect(historyDrawerSource).toContain(
      "source=private-template&status=succeeded",
    );
    expect(historyDrawerSource).toContain(
      'new CustomEvent("reference-history:reuse"',
    );
    expect(pageSource).toContain(
      'root.addEventListener("reference-history:reuse"',
    );
    expect(pageSource).toContain("selectedTemplateId = template.id");
  });

  it("keeps private-reference filtering across full history pagination", () => {
    expect(jobsApiSource).toContain("normalizeHistorySource");
    expect(jobsApiSource).toContain(
      "json_extract(result_json, '$.lookSource')",
    );
    expect(historyPageSource).toContain(
      'if (historySource) params.set("source", historySource)',
    );
  });
});
