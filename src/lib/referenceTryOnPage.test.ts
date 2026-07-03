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
    expect(workspaceSource).toContain("--rt-accent: #c83e68");
    expect(workspaceSource).not.toMatch(/font-size: 0\.(68|70|72|74)rem/);
  });

  it("contains source controls within the reference card", () => {
    expect(workspaceSource).toContain(".reference-workspace-grid *");
    expect(workspaceSource).toContain("box-sizing: border-box");
    expect(workspaceSource).toMatch(
      /\.reference-dropzone input\[type="file"\][\s\S]*?width: 100%;[\s\S]*?min-width: 0;/,
    );
    expect(workspaceSource).toMatch(
      /\.reference-name input[\s\S]*?width: 100%;[\s\S]*?max-width: 100%;[\s\S]*?min-width: 0;/,
    );
  });

  it("uses one contextual authorization control for both uploads", () => {
    expect(workspaceSource.match(/data-authorization-check/g)).toHaveLength(1);
    expect(workspaceSource).not.toContain("data-rights-check");
    expect(workspaceSource).not.toContain("data-consent-check");
    expect(workspaceSource).toContain("data-upload-copy={copy.authorization}");
    expect(workspaceSource).toContain(
      "data-saved-copy={copy.authorizationSaved}",
    );
    expect(workspaceSource).toContain('data-error="authorization"');
    expect(pageSource).toContain(
      'failures.push(["authorization", copy.authorizationRequired])',
    );
    expect(pageSource).toContain("function resetAuthorization()");
    const referenceChange = pageSource.slice(
      pageSource.indexOf('referenceInput.addEventListener("change"'),
      pageSource.indexOf('selfieInput.addEventListener("change"'),
    );
    const selfieChange = pageSource.slice(
      pageSource.indexOf('selfieInput.addEventListener("change"'),
      pageSource.indexOf('authorizationCheck.addEventListener("change"'),
    );
    expect(referenceChange).toContain("resetAuthorization()");
    expect(selfieChange).not.toContain("resetAuthorization()");
  });

  it("keeps authorization and quota in the left submit column", () => {
    const submitMarkup = workspaceSource.slice(
      workspaceSource.indexOf('<div class="reference-submit">'),
      workspaceSource.indexOf("</form>"),
    );
    expect(submitMarkup).toContain('class="reference-submit-info"');
    expect(submitMarkup).toContain('class="reference-submit-meta"');
    expect(submitMarkup).not.toContain('class="reference-submit-action"');
    expect(submitMarkup.indexOf("data-authorization-check")).toBeLessThan(
      submitMarkup.indexOf("data-cost-note"),
    );
    expect(submitMarkup.indexOf("data-cost-note")).toBeLessThan(
      submitMarkup.indexOf("data-generate"),
    );
    expect(workspaceSource).toContain("@media (max-width: 980px)");
  });

  it("uses the shared 1280px shell without a redundant stepper", () => {
    expect(workspaceSource).not.toContain('class="rt-stepper"');
    expect(workspaceSource).not.toContain(".rt-stepper {");
    expect(workspaceSource).toContain(
      "body.reference-tryon-body .site-header-minimal .site-nav",
    );
    expect(workspaceSource).toContain(
      "width: min(calc(100% - 40px), var(--max));",
    );
    expect(workspaceSource).toContain(
      "minmax(250px, 300px) minmax(480px, 1fr)",
    );
    expect(historyDrawerSource).toContain("grid-column: 3");
    expect(pageSource).toContain("function updateSourceReadiness()");
    expect(pageSource).not.toContain("const stepperNodes =");
  });

  it("localizes the combined authorization experience for all locales", () => {
    expect(copySource.match(/authorization:/g)).toHaveLength(9);
    expect(copySource.match(/authorizationSaved:/g)).toHaveLength(9);
    expect(copySource.match(/authorizationRequired:/g)).toHaveLength(9);
    expect(copySource.match(/photoNoticeLink:/g)).toHaveLength(9);
    expect(copySource.match(/privacyHint:/g)).toHaveLength(9);
    expect(copySource.match(/quotaLabel:/g)).toHaveLength(9);
    expect(copySource.match(/quotaAria:/g)).toHaveLength(9);
  });

  it("uses a persistent desktop history region and a mobile dialog", () => {
    expect(workspaceSource).toContain("ReferenceTryOnHistoryDrawer");
    expect(interfaceSource).toContain("data-reference-history-trigger");
    const drawerMarkup = historyDrawerSource.slice(
      0,
      historyDrawerSource.indexOf("<script"),
    );
    expect(drawerMarkup).not.toContain('role="dialog"');
    expect(drawerMarkup).not.toContain('aria-modal="true"');
    expect(historyDrawerSource).toContain(
      'drawer.setAttribute("role", "dialog")',
    );
    expect(historyDrawerSource).toContain(
      'drawer.setAttribute("aria-modal", "true")',
    );
    expect(historyDrawerSource).toContain('drawer.removeAttribute("role")');
    expect(historyDrawerSource).toContain(
      'drawer.removeAttribute("aria-modal")',
    );
    expect(workspaceSource).toMatch(
      /@media \(min-width: 1181px\)[\s\S]*?\.rt-history-trigger[\s\S]*?display: none/,
    );
    expect(historyDrawerSource).toContain('event.key === "Escape"');
    expect(historyDrawerSource).toContain("env(safe-area-inset-bottom)");
  });

  it("keeps quota, templates, and privacy messaging unambiguous", () => {
    expect(workspaceSource).toContain("data-workspace-quota-item");
    expect(workspaceSource).toContain("data-quota-aria={copy.quotaAria}");
    expect(workspaceSource).toContain("<span>{copy.quotaLabel}</span>");
    expect(workspaceSource).toContain(
      '<details class="saved-reference-block" open>',
    );
    expect(workspaceSource.match(/\{copy\.privacyTitle\}/g)).toHaveLength(1);
    expect(copySource).toContain('savedTitle: "Reference templates"');
    expect(copySource).toContain('savedTitle: "参考模板"');
  });

  it("tracks sanitized entry attribution without shipping legacy markup", () => {
    expect(pageSource).toContain('Astro.url.searchParams.get("source")');
    expect(pageSource).toContain("data-entry-source={entrySource}");
    expect(pageSource).toContain('trackEvent("reference_tryon_viewed"');
    expect(pageSource).not.toContain("data-reference-tryon-legacy");
    expect(pageSource).toContain("workspaceQuotaItem.dataset.quotaAria");
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
