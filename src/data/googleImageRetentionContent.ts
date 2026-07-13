import { languageConfigs, type AppLocale } from "../i18n/config";
import { googleImageAssets } from "../seo/googleImageAssets";

type RetentionCopy = {
  readonly kicker: string;
  readonly titleTemplate: string;
  readonly bodyTemplate: string;
  readonly primaryLabel: string;
  readonly secondaryLabel: string;
  readonly proofPoints: readonly string[];
  readonly decisionLabel: string;
  readonly decisionTitle: string;
  readonly decisionBodyTemplate: string;
  readonly stickyLabel: string;
};

type TopicCopy = Record<AppLocale, string>;

export interface GoogleImageRetentionTopic {
  readonly englishPath: string;
  readonly lookSlug: string;
  readonly sourceKey: string;
  readonly pinVisual: string;
  readonly marketProfile?: string;
  readonly eastAsiaPinVisual?: string;
  readonly eastAsiaMarketProfile?: string;
  readonly utmContent: string;
  readonly topic: TopicCopy;
}

export interface GoogleImageRetentionContent {
  readonly topic: GoogleImageRetentionTopic;
  readonly copy: RetentionCopy;
  readonly topicName: string;
  readonly title: string;
  readonly body: string;
  readonly decisionBody: string;
}

const languageLocales = languageConfigs.map((language) => language.locale);

function withLatinFallbacks(
  values: Omit<Record<AppLocale, string>, "es-419"> & { "es-419"?: string },
): TopicCopy {
  return {
    ...values,
    "es-419": values["es-419"] ?? values["es-ES"],
  };
}

const copyByLocale: Record<AppLocale, RetentionCopy> = {
  en: {
    kicker: "From Google Images",
    titleTemplate: "Try {topic} on your face",
    bodyTemplate:
      "If this image brought you here, preview the same makeup direction on your selfie before you apply it.",
    primaryLabel: "Upload selfie - free preview",
    secondaryLabel: "See member benefits",
    proofPoints: [
      "Same visual direction",
      "One no-sign-up preview",
      "Upgrade to save the result",
    ],
    decisionLabel: "Next best step",
    decisionTitle: "Do not just save the image",
    decisionBodyTemplate:
      "Use the free preview to check color, intensity, and real-light fit for {topic}.",
    stickyLabel: "Try this look free",
  },
  "zh-CN": {
    kicker: "来自 Google 图片",
    titleTemplate: "把{topic}试到自己脸上",
    bodyTemplate:
      "如果你是被这张图吸引进来的，先用自己的自拍预览同一个妆容方向，再决定要不要照着化。",
    primaryLabel: "上传自拍，免费预览",
    secondaryLabel: "查看会员权益",
    proofPoints: ["同一个视觉方向", "无需注册先试一次", "升级后保存结果"],
    decisionLabel: "下一步",
    decisionTitle: "不要只保存图片",
    decisionBodyTemplate:
      "用免费预览检查{topic}在你脸上的颜色、浓淡和真实光线效果。",
    stickyLabel: "免费试这个妆",
  },
  "de-DE": {
    kicker: "Aus Google Bilder",
    titleTemplate: "{topic} auf deinem Gesicht testen",
    bodyTemplate:
      "Wenn dich dieses Bild hierher gebracht hat, prüfe dieselbe Make-up-Richtung zuerst auf deinem Selfie.",
    primaryLabel: "Selfie hochladen - gratis Vorschau",
    secondaryLabel: "Mitgliedsvorteile ansehen",
    proofPoints: [
      "Gleiche visuelle Richtung",
      "Eine Vorschau ohne Registrierung",
      "Upgrade zum Speichern",
    ],
    decisionLabel: "Nächster Schritt",
    decisionTitle: "Nicht nur das Bild speichern",
    decisionBodyTemplate:
      "Nutze die Gratisvorschau, um Farbe, Intensität und Lichtwirkung für {topic} zu prüfen.",
    stickyLabel: "Look gratis testen",
  },
  "fr-FR": {
    kicker: "Depuis Google Images",
    titleTemplate: "Tester {topic} sur votre visage",
    bodyTemplate:
      "Si cette image vous a amenée ici, prévisualisez la même direction maquillage sur votre selfie avant de l'appliquer.",
    primaryLabel: "Importer un selfie - aperçu gratuit",
    secondaryLabel: "Voir les avantages membre",
    proofPoints: [
      "Même direction visuelle",
      "Un aperçu sans inscription",
      "Passez membre pour sauvegarder",
    ],
    decisionLabel: "Prochaine étape",
    decisionTitle: "Ne gardez pas seulement l'image",
    decisionBodyTemplate:
      "Utilisez l'aperçu gratuit pour vérifier couleur, intensité et rendu en vraie lumière pour {topic}.",
    stickyLabel: "Tester ce look gratuit",
  },
  "ja-JP": {
    kicker: "Google 画像から",
    titleTemplate: "{topic}を自分の顔で試す",
    bodyTemplate:
      "この画像を見て来たなら、同じメイク方向を自分のセルフィーで先にプレビューできます。",
    primaryLabel: "セルフィーをアップロード - 無料プレビュー",
    secondaryLabel: "メンバー特典を見る",
    proofPoints: [
      "同じビジュアル方向",
      "登録前に1回プレビュー",
      "アップグレードで結果を保存",
    ],
    decisionLabel: "次のステップ",
    decisionTitle: "画像を保存するだけで終わらせない",
    decisionBodyTemplate:
      "{topic}の色、濃さ、実際の光での見え方を無料プレビューで確認できます。",
    stickyLabel: "このルックを無料で試す",
  },
  "ko-KR": {
    kicker: "Google 이미지에서",
    titleTemplate: "{topic}을 내 얼굴에 미리 보기",
    bodyTemplate:
      "이 이미지가 마음에 들어 들어왔다면, 같은 메이크업 방향을 내 셀피에서 먼저 확인해 보세요.",
    primaryLabel: "셀피 업로드 - 무료 미리 보기",
    secondaryLabel: "멤버십 혜택 보기",
    proofPoints: [
      "같은 비주얼 방향",
      "가입 전 1회 미리 보기",
      "업그레이드하면 결과 저장",
    ],
    decisionLabel: "다음 단계",
    decisionTitle: "이미지만 저장하고 끝내지 마세요",
    decisionBodyTemplate:
      "무료 미리 보기로 {topic}의 색감, 강도, 실제 조명 적합도를 확인하세요.",
    stickyLabel: "이 룩 무료로 시험하기",
  },
  "zh-TW": {
    kicker: "來自 Google 圖片",
    titleTemplate: "把{topic}試到自己臉上",
    bodyTemplate:
      "如果你是被這張圖吸引進來的，先用自己的自拍預覽同一個妝容方向，再決定要不要照著化。",
    primaryLabel: "上傳自拍，免費預覽",
    secondaryLabel: "查看會員權益",
    proofPoints: ["同一個視覺方向", "無需註冊先試一次", "升級後保存結果"],
    decisionLabel: "下一步",
    decisionTitle: "不要只保存圖片",
    decisionBodyTemplate:
      "用免費預覽檢查{topic}在你臉上的顏色、濃淡和真實光線效果。",
    stickyLabel: "免費試這個妝",
  },
  "es-ES": {
    kicker: "Desde Google Imágenes",
    titleTemplate: "Prueba {topic} en tu rostro",
    bodyTemplate:
      "Si esta imagen te trajo aquí, previsualiza la misma dirección de maquillaje en tu selfie antes de aplicarla.",
    primaryLabel: "Subir selfie - vista previa gratis",
    secondaryLabel: "Ver beneficios de miembro",
    proofPoints: [
      "Misma dirección visual",
      "Una vista previa sin registro",
      "Mejora para guardar el resultado",
    ],
    decisionLabel: "Siguiente paso",
    decisionTitle: "No guardes solo la imagen",
    decisionBodyTemplate:
      "Usa la vista previa gratis para revisar color, intensidad y luz real en {topic}.",
    stickyLabel: "Probar este look gratis",
  },
  "es-419": {
    kicker: "Desde Google Imágenes",
    titleTemplate: "Prueba {topic} en tu rostro",
    bodyTemplate:
      "Si esta imagen te trajo aquí, previsualiza la misma dirección de maquillaje en tu selfie antes de aplicarla.",
    primaryLabel: "Subir selfie - vista previa gratis",
    secondaryLabel: "Ver beneficios de miembro",
    proofPoints: [
      "Misma dirección visual",
      "Una vista previa sin registro",
      "Mejora para guardar el resultado",
    ],
    decisionLabel: "Siguiente paso",
    decisionTitle: "No guardes solo la imagen",
    decisionBodyTemplate:
      "Usa la vista previa gratis para revisar color, intensidad y luz real en {topic}.",
    stickyLabel: "Probar este look gratis",
  },
  "pt-BR": {
    kicker: "Do Google Imagens",
    titleTemplate: "Teste {topic} no seu rosto",
    bodyTemplate:
      "Se esta imagem trouxe você até aqui, visualize a mesma direção de maquiagem na sua selfie antes de aplicar.",
    primaryLabel: "Enviar selfie - prévia grátis",
    secondaryLabel: "Ver benefícios de membro",
    proofPoints: [
      "Mesma direção visual",
      "Uma prévia sem cadastro",
      "Faça upgrade para salvar",
    ],
    decisionLabel: "Próximo passo",
    decisionTitle: "Não salve apenas a imagem",
    decisionBodyTemplate:
      "Use a prévia grátis para conferir cor, intensidade e luz real em {topic}.",
    stickyLabel: "Testar este look grátis",
  },
};

const googleImageRetentionTopics: readonly GoogleImageRetentionTopic[] = [
  {
    englishPath: "/ai-makeup-try-on",
    lookSlug: "refined",
    sourceKey: "ai_tryon",
    pinVisual: "soft_glam_refined",
    utmContent: "google_image_ai_tryon_01",
    topic: withLatinFallbacks({
      en: "AI makeup try-on",
      "zh-CN": "AI 试妆",
      "de-DE": "AI-Make-up-Test",
      "fr-FR": "essai maquillage IA",
      "ja-JP": "AIメイク試着",
      "ko-KR": "AI 메이크업 미리 보기",
      "zh-TW": "AI 試妝",
      "es-ES": "prueba de maquillaje con IA",
      "pt-BR": "teste de maquiagem com IA",
    }),
  },
  {
    englishPath: "/scenarios/quick-5min",
    lookSlug: "five-minute-beginner",
    sourceKey: "quick5",
    pinVisual: "quick5_real_morning",
    utmContent: "google_image_quick5_01",
    topic: withLatinFallbacks({
      en: "5-minute makeup",
      "zh-CN": "5 分钟妆容",
      "de-DE": "5-Minuten-Make-up",
      "fr-FR": "maquillage en 5 minutes",
      "ja-JP": "5分メイク",
      "ko-KR": "5분 메이크업",
      "zh-TW": "5 分鐘妝容",
      "es-ES": "maquillaje de 5 minutos",
      "pt-BR": "maquiagem de 5 minutos",
    }),
  },
  {
    englishPath: "/looks/soft-glam",
    lookSlug: "rose-milk-date",
    sourceKey: "soft_glam",
    pinVisual: "soft_glam_refined",
    utmContent: "google_image_soft_glam_01",
    topic: withLatinFallbacks({
      en: "soft glam makeup",
      "zh-CN": "柔和精致妆",
      "de-DE": "Soft-Glam-Make-up",
      "fr-FR": "maquillage soft glam",
      "ja-JP": "ソフトグラムメイク",
      "ko-KR": "소프트 글램 메이크업",
      "zh-TW": "柔和精緻妝",
      "es-ES": "maquillaje soft glam",
      "pt-BR": "maquiagem soft glam",
    }),
  },
  {
    englishPath: "/scenarios/wedding-guest",
    lookSlug: "wedding-guest",
    sourceKey: "wedding_guest",
    pinVisual: "wedding_guest_daylight",
    utmContent: "google_image_wedding_guest_01",
    topic: withLatinFallbacks({
      en: "wedding guest makeup",
      "zh-CN": "婚礼宾客妆",
      "de-DE": "Make-up für Hochzeitsgäste",
      "fr-FR": "maquillage invitée de mariage",
      "ja-JP": "結婚式ゲストメイク",
      "ko-KR": "하객 메이크업",
      "zh-TW": "婚禮賓客妝",
      "es-ES": "maquillaje de invitada de boda",
      "pt-BR": "maquiagem para convidada de casamento",
    }),
  },
  {
    englishPath: "/scenarios/office",
    lookSlug: "commute",
    sourceKey: "office",
    pinVisual: "office_real_workday",
    utmContent: "google_image_office_01",
    topic: withLatinFallbacks({
      en: "office makeup",
      "zh-CN": "办公室妆容",
      "de-DE": "Büro-Make-up",
      "fr-FR": "maquillage bureau",
      "ja-JP": "オフィスメイク",
      "ko-KR": "오피스 메이크업",
      "zh-TW": "辦公室妝容",
      "es-ES": "maquillaje de oficina",
      "pt-BR": "maquiagem para trabalho",
    }),
  },
  {
    englishPath: "/scenarios/first-date",
    lookSlug: "date",
    sourceKey: "date_night",
    pinVisual: "date_night_candlelight",
    utmContent: "google_image_date_night_01",
    topic: withLatinFallbacks({
      en: "date night makeup",
      "zh-CN": "约会夜妆容",
      "de-DE": "Date-Night-Make-up",
      "fr-FR": "maquillage rendez-vous",
      "ja-JP": "デートメイク",
      "ko-KR": "데이트 메이크업",
      "zh-TW": "約會夜妝容",
      "es-ES": "maquillaje para cita",
      "pt-BR": "maquiagem para encontro",
    }),
  },
  {
    englishPath: "/for/hooded-eyes",
    lookSlug: "hooded-eyes-lift",
    sourceKey: "hooded_eyes",
    pinVisual: "hooded_visible_shadow",
    utmContent: "google_image_hooded_eyes_01",
    topic: withLatinFallbacks({
      en: "hooded eyes makeup",
      "zh-CN": "肿泡眼妆容",
      "de-DE": "Make-up für Schlupflider",
      "fr-FR": "maquillage paupières tombantes",
      "ja-JP": "奥二重・まぶた重めメイク",
      "ko-KR": "후드형 눈 메이크업",
      "zh-TW": "腫泡眼妝容",
      "es-ES": "maquillaje para párpados encapotados",
      "pt-BR": "maquiagem para pálpebras caídas",
    }),
  },
  {
    englishPath: "/scenarios/passport-photo",
    lookSlug: "passport-photo-clean",
    sourceKey: "passport_photo",
    pinVisual: "passport_no_flashback",
    utmContent: "google_image_passport_photo_01",
    topic: withLatinFallbacks({
      en: "passport photo makeup",
      "zh-CN": "证件照妆容",
      "de-DE": "Passfoto-Make-up",
      "fr-FR": "maquillage photo d'identité",
      "ja-JP": "証明写真メイク",
      "ko-KR": "증명사진 메이크업",
      "zh-TW": "證件照妝容",
      "es-ES": "maquillaje para foto de pasaporte",
      "pt-BR": "maquiagem para foto de passaporte",
    }),
  },
  {
    englishPath: "/looks/glass-skin",
    lookSlug: "korean-dewy-glow",
    sourceKey: "glass_skin",
    pinVisual: "glass_skin_not_greasy",
    utmContent: "google_image_glass_skin_01",
    topic: withLatinFallbacks({
      en: "glass skin makeup",
      "zh-CN": "玻璃肌妆容",
      "de-DE": "Glass-Skin-Make-up",
      "fr-FR": "maquillage glass skin",
      "ja-JP": "水光肌メイク",
      "ko-KR": "글래스 스킨 메이크업",
      "zh-TW": "玻璃肌妝容",
      "es-ES": "maquillaje efecto glass skin",
      "pt-BR": "maquiagem glass skin",
    }),
  },
  {
    englishPath: "/scenarios/nighttime",
    lookSlug: "evening",
    sourceKey: "smudged_smoky",
    pinVisual: "smudged_smoky_night",
    marketProfile: "global-diverse",
    eastAsiaPinVisual: "smudged_smoky_east_asia",
    eastAsiaMarketProfile: "east-asia",
    utmContent: "google_image_smudged_smoky_01",
    topic: withLatinFallbacks({
      en: "smudged smoky-eye makeup",
      "zh-CN": "晕染烟熏眼妆",
      "de-DE": "verrauchtes Smokey-Eye-Make-up",
      "fr-FR": "maquillage smoky diffus",
      "ja-JP": "ぼかしスモーキーアイメイク",
      "ko-KR": "스머지 스모키 아이 메이크업",
      "zh-TW": "暈染煙燻眼妝",
      "es-ES": "maquillaje de ojos ahumado difuminado",
      "pt-BR": "maquiagem esfumada de olhos smoky",
    }),
  },
  {
    englishPath: "/for/mature-skin",
    lookSlug: "mature-skin-radiance",
    sourceKey: "mature_skin",
    pinVisual: "mature_skin_no_caking",
    marketProfile: "global-diverse",
    eastAsiaPinVisual: "mature_skin_radiance_east_asia",
    eastAsiaMarketProfile: "east-asia",
    utmContent: "google_image_mature_skin_01",
    topic: withLatinFallbacks({
      en: "luminous makeup for mature skin",
      "zh-CN": "熟龄肌焕亮妆",
      "de-DE": "leuchtendes Make-up für reife Haut",
      "fr-FR": "maquillage lumineux pour peau mature",
      "ja-JP": "大人肌向けツヤメイク",
      "ko-KR": "성숙한 피부를 위한 광채 메이크업",
      "zh-TW": "熟齡肌煥亮妝",
      "es-ES": "maquillaje luminoso para piel madura",
      "pt-BR": "maquiagem luminosa para pele madura",
    }),
  },
] as const;

const topicsByEnglishPath = new Map(
  googleImageRetentionTopics.map((topic) => [topic.englishPath, topic]),
);

function formatTemplate(template: string, topic: string): string {
  return template.replaceAll("{topic}", topic);
}

function normalizeLocale(locale: string | undefined): AppLocale {
  if (locale && locale in copyByLocale) return locale as AppLocale;
  if (locale?.startsWith("zh-TW")) return "zh-TW";
  if (locale?.startsWith("zh")) return "zh-CN";
  if (locale?.startsWith("de")) return "de-DE";
  if (locale?.startsWith("fr")) return "fr-FR";
  if (locale?.startsWith("ja")) return "ja-JP";
  if (locale?.startsWith("ko")) return "ko-KR";
  if (locale?.startsWith("es")) return "es-ES";
  if (locale?.startsWith("pt")) return "pt-BR";
  return "en";
}

export function getGoogleImageRetentionTopic(englishPath: string) {
  return topicsByEnglishPath.get(englishPath);
}

export function getGoogleImageRetentionContent(
  englishPath: string,
  locale: string | undefined,
): GoogleImageRetentionContent | undefined {
  const topic = getGoogleImageRetentionTopic(englishPath);
  if (!topic) return undefined;

  const normalizedLocale = normalizeLocale(locale);
  const copy = copyByLocale[normalizedLocale] ?? copyByLocale.en;
  const topicName = topic.topic[normalizedLocale] ?? topic.topic.en;
  const isEastAsianLocale = ["zh-CN", "zh-TW", "ja-JP", "ko-KR"].includes(
    normalizedLocale,
  );
  const localizedTopic: GoogleImageRetentionTopic = isEastAsianLocale
    ? {
        ...topic,
        pinVisual: topic.eastAsiaPinVisual ?? topic.pinVisual,
        marketProfile:
          topic.eastAsiaMarketProfile ?? topic.marketProfile ?? "east-asia",
      }
    : topic;

  return {
    topic: localizedTopic,
    copy,
    topicName,
    title: formatTemplate(copy.titleTemplate, topicName),
    body: formatTemplate(copy.bodyTemplate, topicName),
    decisionBody: formatTemplate(copy.decisionBodyTemplate, topicName),
  };
}

export function getGoogleImageRetentionTryOnPath(
  topic: GoogleImageRetentionTopic,
) {
  const params = new URLSearchParams({
    look: topic.lookSlug,
    guest_try: "1",
    source: `google_images_${topic.sourceKey}`,
    pin_visual: topic.pinVisual,
    utm_source: "google_images",
    utm_medium: "organic_search",
    utm_campaign: "image_retention",
    utm_content: topic.utmContent,
  });
  if (topic.marketProfile) {
    params.set("marketProfile", topic.marketProfile);
  }

  return `/tryon?${params.toString()}#tryon-upload`;
}

export function getGoogleImageRetentionPricingPath(
  topic: GoogleImageRetentionTopic,
) {
  return `/pricing?source=google_images_${topic.sourceKey}`;
}

export function getActiveGoogleImageRetentionLocales() {
  return languageLocales;
}

export function getGoogleImageRetentionEnglishPaths() {
  return googleImageRetentionTopics.map((topic) => topic.englishPath);
}

export function getMissingGoogleImageRetentionPaths() {
  const retentionPaths = new Set(getGoogleImageRetentionEnglishPaths());
  const assetPaths = new Set(googleImageAssets.map((asset) => asset.pageUrl));

  return [...assetPaths].filter((pageUrl) => !retentionPaths.has(pageUrl));
}
