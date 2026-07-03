import { describe, expect, it } from "vitest";

import homePageSource from "../components/HomePage.astro?raw";

describe("homepage reference try-on promotion", () => {
  it("renders the complete reference plus selfie to result story", () => {
    const promoMarkup = homePageSource.slice(
      homePageSource.indexOf(
        'class="shell home-section reference-promo-section"',
      ),
      homePageSource.indexOf('<section class="shell home-section ai-section"'),
    );

    expect(promoMarkup).toContain('class="reference-promo-result"');
    expect(promoMarkup).toContain("src={heroImageAfter}");
    expect(promoMarkup).toContain('decoding="async"');
    expect(promoMarkup).toContain("referencePromoCopy.result");
  });

  it("overrides intrinsic image heights to prevent oversized promo cards", () => {
    expect(homePageSource).toMatch(
      /\.reference-promo-flow img\s*\{[\s\S]*?width: 100%;[\s\S]*?height: auto;[\s\S]*?aspect-ratio: 4 \/ 5;/,
    );
  });

  it("keeps the private result visible in the mobile flow", () => {
    const mobileStyles = homePageSource.slice(
      homePageSource.indexOf("@media (max-width: 700px)"),
    );

    expect(mobileStyles).toMatch(
      /\.reference-promo-result\s*\{[\s\S]*?grid-column: 1 \/ -1;[\s\S]*?grid-row: 3;[\s\S]*?display: grid;/,
    );
    expect(mobileStyles).not.toMatch(
      /\.reference-promo-result\s*\{\s*display: none;/,
    );
  });

  it("balances the diagnosis image against its explanatory copy", () => {
    expect(homePageSource).toContain(
      "min(calc(100vw - 84px), 600px), min(40vw, 480px)",
    );
    expect(homePageSource).toMatch(
      /\.ai-story\s*\{[\s\S]*?grid-template-columns: minmax\(320px, 0\.85fr\) minmax\(0, 1\.15fr\);/,
    );
    expect(homePageSource).toMatch(
      /\.ai-visual\s*\{[\s\S]*?width: min\(100%, 480px\);[\s\S]*?justify-self: center;/,
    );
    expect(homePageSource).toMatch(
      /\.ai-visual img\s*\{[\s\S]*?width: 100%;[\s\S]*?height: auto;[\s\S]*?aspect-ratio: 4 \/ 3;/,
    );
    const mobileStyles = homePageSource.slice(
      homePageSource.indexOf("@media (max-width: 700px)"),
    );
    expect(mobileStyles).toMatch(
      /\.ai-visual\s*\{[\s\S]*?width: min\(100%, 448px\);/,
    );
    expect(mobileStyles).toMatch(
      /\.ai-visual img\s*\{[\s\S]*?aspect-ratio: 16 \/ 10;/,
    );
  });
});
