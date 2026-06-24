import { normalizeLocale, type SupportedLocale } from "./i18n";

export type TryOnDisclaimerKey = "generated" | "referenceFallback";

const tryOnDisclaimerCopy: Record<
  SupportedLocale,
  Record<TryOnDisclaimerKey, string>
> = {
  en: {
    generated:
      "ABS has generated a makeup try-on preview from your selfie. Results are for beauty reference only and may vary with lighting, device, and personal features.",
    referenceFallback:
      "ABS preview is temporarily unavailable, so this result is showing the current makeup reference image. Actual results may vary with your personal features.",
  },
  "zh-CN": {
    generated:
      "ABS 已基于你的自拍生成妆效预览。结果仅供美妆参考，实际效果因光线、设备和个人条件而异。",
    referenceFallback:
      "ABS 妆效预览暂不可用，当前先展示现有妆容参考图，实际效果因个人条件而异。",
  },
  "zh-TW": {
    generated:
      "ABS 已根據你的自拍生成妝效預覽。結果僅供美妝參考，實際效果會因光線、裝置與個人條件而異。",
    referenceFallback:
      "ABS 妝效預覽暫不可用，目前先顯示現有妝容參考圖，實際效果會因個人條件而異。",
  },
  "ja-JP": {
    generated:
      "ABSがあなたのセルフィーをもとにメイクの試着プレビューを生成しました。結果は美容上の参考用であり、照明、デバイス、個人の条件によって実際の見え方は異なります。",
    referenceFallback:
      "ABSの試着プレビューは一時的に利用できないため、現在は既存のメイク参考画像を表示しています。実際の見え方は個人の条件によって異なります。",
  },
  "ko-KR": {
    generated:
      "ABS가 셀피를 바탕으로 메이크업 미리보기를 생성했습니다. 결과는 뷰티 참고용이며 조명, 기기, 개인 조건에 따라 실제 표현은 달라질 수 있습니다.",
    referenceFallback:
      "ABS 미리보기를 일시적으로 사용할 수 없어 현재는 기존 메이크업 참고 이미지를 표시합니다. 실제 표현은 개인 조건에 따라 달라질 수 있습니다.",
  },
  "fr-FR": {
    generated:
      "ABS a genere un apercu de maquillage a partir de votre selfie. Le resultat est fourni a titre de reference beaute et peut varier selon la lumiere, l'appareil et vos caracteristiques personnelles.",
    referenceFallback:
      "L'apercu ABS est temporairement indisponible. Le resultat affiche donc l'image de reference du maquillage actuel. Le rendu reel peut varier selon vos caracteristiques personnelles.",
  },
  "de-DE": {
    generated:
      "ABS hat aus deinem Selfie eine Make-up-Try-on-Vorschau erstellt. Das Ergebnis dient nur als Beauty-Referenz und kann je nach Licht, Geraet und individuellen Merkmalen variieren.",
    referenceFallback:
      "Die ABS-Vorschau ist voruebergehend nicht verfuegbar. Daher wird aktuell das vorhandene Make-up-Referenzbild angezeigt. Das echte Ergebnis kann je nach individuellen Merkmalen variieren.",
  },
  "es-ES": {
    generated:
      "ABS ha generado una vista previa de maquillaje a partir de tu selfie. El resultado es solo una referencia de belleza y puede variar segun la luz, el dispositivo y tus rasgos personales.",
    referenceFallback:
      "La vista previa de ABS no esta disponible temporalmente, asi que se muestra la imagen de referencia del maquillaje actual. El resultado real puede variar segun tus rasgos personales.",
  },
  "es-419": {
    generated:
      "ABS genero una vista previa de maquillaje a partir de tu selfie. El resultado es solo una referencia de belleza y puede variar segun la luz, el dispositivo y tus rasgos personales.",
    referenceFallback:
      "La vista previa de ABS no esta disponible temporalmente, asi que se muestra la imagen de referencia del maquillaje actual. El resultado real puede variar segun tus rasgos personales.",
  },
  "pt-BR": {
    generated:
      "ABS gerou uma previa de maquiagem a partir da sua selfie. O resultado serve apenas como referencia de beleza e pode variar conforme a luz, o aparelho e suas caracteristicas pessoais.",
    referenceFallback:
      "A previa da ABS esta temporariamente indisponivel, entao este resultado mostra a imagem de referencia da maquiagem atual. O efeito real pode variar conforme suas caracteristicas pessoais.",
  },
};

export function localizedTryOnDisclaimer(
  key: TryOnDisclaimerKey,
  locale?: string,
): string {
  return tryOnDisclaimerCopy[normalizeLocale(locale)][key];
}
