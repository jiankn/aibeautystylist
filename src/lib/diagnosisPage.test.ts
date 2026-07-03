import { describe, expect, it } from "vitest";

import diagnosisCopySource from "../data/diagnosisContent.ts?raw";
import diagnosisPageSource from "../pages/diagnosis.astro?raw";
import { DIAGNOSIS_CREDIT_COST } from "./tryonCosts";

describe("diagnosis credit contract", () => {
  it("charges two shared try-on credits per diagnosis", () => {
    expect(DIAGNOSIS_CREDIT_COST).toBe(2);
    expect(diagnosisPageSource).toContain(
      "diagnosisCreditCost: DIAGNOSIS_CREDIT_COST",
    );
    expect(diagnosisPageSource).toContain("remaining < DIAGNOSIS_COST");
    expect(diagnosisPageSource).toContain("safeRemaining < DIAGNOSIS_COST");
  });

  it("shows the cost before the user uploads a selfie", () => {
    expect(diagnosisPageSource).toContain('class="diagnosis-cost-note"');
    expect(diagnosisPageSource).toContain("每次 AI 诊断消耗 2 次试妆额度");
    expect(diagnosisPageSource).toContain(
      "Each AI diagnosis uses 2 try-on credits",
    );
  });

  it("localizes the two-credit cost across supported diagnosis locales", () => {
    for (const label of [
      "2 Credits",
      "2 crédits",
      "2クレジット",
      "2 크레딧",
      "2 點數",
      "2 créditos",
    ]) {
      expect(diagnosisCopySource).toContain(label);
    }
    expect(diagnosisCopySource).not.toContain("Ein Credit");
    expect(diagnosisCopySource).not.toContain("1クレジット");
    expect(diagnosisCopySource).not.toContain("1 크레딧");
    expect(diagnosisCopySource).not.toContain("1 點數");
  });

  it("refreshes quota immediately after creation and terminal updates", () => {
    expect(diagnosisPageSource).toContain("result.job?.quota");
    expect(diagnosisPageSource).toContain("quotaSnapshot = result.job.quota");
    expect(diagnosisPageSource).toContain("quotaSnapshot = job.quota");
  });
});
