import { describe, expect, it } from "vitest";

import type { AppLocale } from "../i18n/config";
import { getLocalizedPricingContent } from "./pricingContent";

const localizedReferenceFeatures: Partial<Record<AppLocale, string>> = {
  "de-DE":
    "Eigenes Make-up-Referenzbild hochladen und privat ausprobieren (2 Credits)",
  "fr-FR": "Importer une référence maquillage pour un essai privé (2 crédits)",
  "ja-JP": "参考メイク画像をアップロードして非公開で試着（1回2クレジット）",
  "ko-KR": "참고 메이크업 이미지를 올려 비공개로 가상 체험(회당 2크레딧)",
  "zh-TW": "上傳參考妝容，建立專屬私密試妝（每次 2 點）",
  "es-ES":
    "Sube una referencia de maquillaje para probarla en privado (2 créditos)",
  "pt-BR":
    "Envie uma referência de maquiagem para testar em modo privado (2 créditos)",
};

describe("pricing reference try-on localization", () => {
  it.each(Object.entries(localizedReferenceFeatures))(
    "uses native %s copy and states the two-credit cost",
    (locale, expected) => {
      const content = getLocalizedPricingContent(locale as AppLocale);
      expect(content?.copy.planContent.premium.features).toContain(expected);
      expect(content?.comparisonLabels.reference).toMatch(/2/);
    },
  );

  it("uses the European Spanish copy for Latin American Spanish", () => {
    expect(getLocalizedPricingContent("es-419")).toBe(
      getLocalizedPricingContent("es-ES"),
    );
  });
});
