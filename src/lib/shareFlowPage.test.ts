import { describe, expect, it } from "vitest";

import workspaceSource from "../components/ReferenceTryOnWorkspace.astro?raw";
import shareApiSource from "../pages/api/shares/index.ts?raw";
import historyPageSource from "../pages/history.astro?raw";
import referencePageSource from "../pages/reference-tryon.astro?raw";
import resultPageSource from "../pages/result/[id].astro?raw";
import shareCardSource from "../pages/share-card.astro?raw";

describe("result sharing flow", () => {
  it("routes reference try-on results through the shared composer", () => {
    expect(workspaceSource).toContain(
      "<a href={hrefs.shareCard} data-share-result>",
    );
    expect(referencePageSource).toContain(
      "shareLink.href = `${hrefs.shareCard}?jobId=",
    );
    expect(referencePageSource).not.toContain(
      'shareBtn?.addEventListener("click", shareResult)',
    );
  });

  it("shows the share entry for every completed result", () => {
    expect(resultPageSource).toContain("shareBtn.hidden = false");
    expect(resultPageSource).not.toContain(
      "shareBtn.hidden = isPrivateReference",
    );
    expect(resultPageSource).toContain(
      "shareBtn.href = `${hrefs.shareCard}?jobId=",
    );
  });

  it("routes history sharing through the same composer", () => {
    expect(historyPageSource).toContain(
      "window.location.href = `${base}?jobId=",
    );
    expect(historyPageSource).not.toContain(
      "async function createPublicShareUrl(job)",
    );
  });

  it("requires explicit public-link consent for private reference results", () => {
    expect(shareCardSource).toContain('id="share-privacy-panel"');
    expect(shareCardSource).toContain("publicShareConsentVersion");
    expect(shareCardSource).toContain('job.lookSource === "private-template"');
    expect(shareApiSource).toContain("PUBLIC_SHARE_CONSENT_REQUIRED");
    expect(shareApiSource).toContain("hasRequiredPublicShareConsent");
  });

  it("localizes the private-share disclosure for all public locales", () => {
    expect(shareCardSource).toContain("const privateShareCopyByLocale");
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
      expect(shareCardSource).toContain(`"${locale}"`);
    }
  });

  it("keeps native sharing behind a direct second user action", () => {
    expect(shareCardSource).toContain("revealShareActions");
    expect(shareCardSource).toContain("const shareUrl = publicShareUrl");
    expect(shareCardSource).toContain("await navigator.share(sharePayload)");
    expect(shareCardSource).toContain("privateShareCopy.cancelled");
    expect(shareCardSource).toContain("copyText(publicShareUrl)");
  });
});
