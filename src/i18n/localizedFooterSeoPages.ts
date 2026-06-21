import type {
  LocalizedSeoCategory,
  LocalizedSeoPage,
  SeoLanguageSlug,
} from "./localizedSeoPages";
import { buildFooterSeoDepth } from "./footerSeoDepth";

type FooterTarget = {
  readonly englishPath: string;
  readonly category: Extract<
    LocalizedSeoCategory,
    "product" | "style" | "scenario"
  >;
};

type KeywordEntry = {
  readonly path: string;
  readonly keyword: string;
  readonly secondaryKeyword: string;
};

type RawKeywordEntry = readonly [
  path: string,
  keyword: string,
  secondaryKeyword: string,
];

type KeywordSpec = FooterTarget &
  KeywordEntry & {
    readonly languageSlug: SeoLanguageSlug;
  };

type LanguageCopy = {
  readonly faqHeading: string;
  readonly relatedHeading: string;
  readonly ctaLabel: string;
  title(spec: KeywordSpec): string;
  description(spec: KeywordSpec): string;
  heroSubtitle(spec: KeywordSpec): string;
  sectionTitle(spec: KeywordSpec): string;
  paragraphs(spec: KeywordSpec): readonly string[];
  stepsTitle(spec: KeywordSpec): string;
  steps(spec: KeywordSpec): readonly { title: string; body: string }[];
  compareTitle(spec: KeywordSpec): string;
  rows(
    spec: KeywordSpec,
  ): readonly { label: string; good: string; avoid: string }[];
  highlight(spec: KeywordSpec): string;
  ctaTitle(spec: KeywordSpec): string;
  ctaText(spec: KeywordSpec): string;
  faq(spec: KeywordSpec): readonly { q: string; a: string }[];
};

// Primary and secondary phrases are selected from keyword-kd-results.csv.
// When the CSV has no exact local equivalent, the primary phrase preserves the
// target intent and the closest CSV phrase is used as a secondary keyword.
export const footerSeoTargets: readonly FooterTarget[] = [
  { englishPath: "/ai-makeup-try-on", category: "product" },
  { englishPath: "/virtual-makeup-app", category: "product" },
  { englishPath: "/looks/soft-glam", category: "style" },
  { englishPath: "/looks/natural-makeup", category: "style" },
  { englishPath: "/looks/no-makeup-makeup", category: "style" },
  { englishPath: "/looks/dewy-skin", category: "style" },
  { englishPath: "/looks/glass-skin", category: "style" },
  { englishPath: "/looks/clean-girl", category: "style" },
  { englishPath: "/scenarios/interview", category: "scenario" },
  { englishPath: "/scenarios/office", category: "scenario" },
  { englishPath: "/scenarios/first-date", category: "scenario" },
  { englishPath: "/scenarios/passport-photo", category: "scenario" },
  { englishPath: "/scenarios/wedding-guest", category: "scenario" },
  { englishPath: "/scenarios/prom", category: "scenario" },
];

const rawKeywordsByLanguage: Record<
  SeoLanguageSlug,
  readonly RawKeywordEntry[]
> = {
  "zh-cn": [
    ["/ai-在线试妆", "AI 在线试妆", "虚拟试妆"],
    ["/虚拟试妆应用", "虚拟试妆应用", "在线试妆"],
    ["/looks/柔和精致妆", "柔和精致妆", "soft glam 妆容"],
    ["/looks/自然妆", "自然妆", "日常自然妆容"],
    ["/looks/伪素颜妆", "伪素颜妆", "裸妆"],
    ["/looks/水光肌妆", "水光肌妆", "光泽肌妆容"],
    ["/looks/玻璃肌妆", "玻璃肌妆", "韩系妆容"],
    ["/looks/干净自然妆", "Clean Girl 妆", "干净自然日常妆"],
    ["/scenarios/面试妆", "面试妆", "面试化妆技巧"],
    ["/scenarios/通勤妆", "通勤妆", "上班妆"],
    ["/scenarios/初次约会妆", "初次约会妆", "约会妆"],
    ["/scenarios/证件照妆", "证件照妆", "照片妆容"],
    ["/scenarios/婚礼宾客妆", "婚礼宾客妆", "婚礼妆容"],
    ["/scenarios/毕业舞会妆", "毕业舞会妆", "毕业派对妆容"],
  ],
  de: [
    ["/ki-make-up-test", "KI Make-up Test", "virtuelles Make-up Testen"],
    ["/make-up-simulator", "Make-up Simulator", "virtuelles Make-up Testen"],
    ["/looks/sanfter-glam", "Sanfter Glam Look", "elegantes Make-up"],
    ["/looks/natuerliches-make-up", "Natürliches Make-up", "Alltags-Make-up"],
    ["/looks/nude-make-up", "Nude Make-up", "dezent schminken"],
    ["/looks/glow-make-up", "Glow Make-up", "frischer Teint"],
    ["/looks/glass-skin", "Glass Skin Make-up", "Glow Make-up"],
    ["/looks/clean-beauty", "Clean Beauty Look", "Alltags-Make-up"],
    [
      "/scenarios/vorstellungsgespraech",
      "Vorstellungsgespräch Make-up",
      "Bewerbungsfoto Make-up",
    ],
    ["/scenarios/buero", "Make-up fürs Büro", "Make-up für den Alltag"],
    ["/scenarios/erstes-date", "Date Make-up", "Make-up für ein erstes Date"],
    ["/scenarios/reisepass-foto", "Reisepass-Foto Make-up", "Foto-Make-up"],
    ["/scenarios/hochzeit", "Hochzeit Make-up Gast", "festliches Make-up"],
    ["/scenarios/abschlussball", "Abschlussball Make-up", "festliches Make-up"],
  ],
  fr: [
    ["/test-maquillage-ia", "test maquillage virtuel", "IA maquillage"],
    [
      "/application-maquillage-virtuel",
      "simulation maquillage en ligne",
      "test maquillage virtuel",
    ],
    ["/looks/glam-doux", "maquillage doux", "maquillage élégant"],
    ["/looks/maquillage-naturel", "maquillage naturel", "maquillage de jour"],
    ["/looks/maquillage-nude", "maquillage nude", "teint parfait naturel"],
    ["/looks/teint-lumineux", "teint lumineux", "look glowy"],
    ["/looks/glass-skin", "maquillage glass skin", "teint frais"],
    ["/looks/clean-girl", "maquillage clean girl", "maquillage minimaliste"],
    [
      "/scenarios/entretien",
      "maquillage entretien d'embauche",
      "maquillage pour photo",
    ],
    ["/scenarios/bureau", "maquillage pour le bureau", "maquillage de jour"],
    [
      "/scenarios/premier-rendez-vous",
      "maquillage premier rendez-vous",
      "maquillage de soirée",
    ],
    [
      "/scenarios/photo-identite",
      "maquillage photo d'identité",
      "maquillage pour photo",
    ],
    ["/scenarios/mariage", "maquillage invité mariage", "maquillage de soirée"],
    ["/scenarios/bal", "maquillage bal", "maquillage de soirée"],
  ],
  ja: [
    ["/バーチャルメイク", "バーチャルメイク", "AIメイク診断"],
    ["/メイクシミュレーション", "メイクシミュレーション", "バーチャルメイク"],
    ["/looks/ソフトグラム", "ソフトグラムメイク", "大人ナチュラルメイク"],
    ["/looks/ナチュラル", "ナチュラルメイク", "大人ナチュラルメイク"],
    ["/looks/ノーメイク風", "ノーメイク風メイク", "清楚メイク"],
    ["/looks/ツヤ肌", "ツヤ肌メイク", "透明感メイク"],
    ["/looks/グラススキン", "グラススキンメイク", "韓国風メイク"],
    ["/looks/クリーンガール", "クリーンガールメイク", "垢抜けメイク"],
    ["/scenarios/面接", "面接メイク", "写真映えメイク"],
    ["/scenarios/オフィス", "オフィスメイク", "通勤メイク"],
    ["/scenarios/初デート", "デートメイク", "写真映えメイク"],
    ["/scenarios/証明写真", "証明写真メイク", "写真映えメイク"],
    ["/scenarios/結婚式ゲスト", "結婚式ゲストメイク", "パーティーメイク"],
    ["/scenarios/卒業パーティー", "卒業パーティーメイク", "卒業式メイク"],
  ],
  ko: [
    ["/가상-메이크업-체험", "가상 메이크업 체험", "AI 메이크업 진단"],
    ["/ai-메이크업-앱", "AI 메이크업 앱", "가상 메이크업 체험"],
    ["/looks/소프트-글램", "소프트 글램 메이크업", "러블리 메이크업"],
    ["/looks/데일리", "데일리 메이크업", "내추럴 메이크업"],
    ["/looks/노메이크업", "노메이크업 메이크업", "내추럴 메이크업"],
    ["/looks/글로우", "글로우 메이크업", "결광 메이크업"],
    ["/looks/속광", "속광 메이크업", "K-뷰티 메이크업"],
    ["/looks/클린걸", "클린 걸 메이크업", "청순 메이크업"],
    ["/scenarios/면접", "면접 메이크업", "프로필 사진 메이크업"],
    ["/scenarios/출근", "출근 메이크업", "데일리 메이크업"],
    ["/scenarios/첫데이트", "데이트 메이크업", "소개팅 메이크업"],
    ["/scenarios/증명사진", "증명사진 메이크업", "프로필 사진 메이크업"],
    ["/scenarios/웨딩게스트", "웨딩 게스트 메이크업", "파티 메이크업"],
    ["/scenarios/졸업파티", "졸업 파티 메이크업", "졸업식 메이크업"],
  ],
  "zh-tw": [
    ["/ai-線上試妝", "線上試妝", "AI 妝容診斷"],
    ["/虛擬試妝應用", "虛擬試妝", "AI 彩妝推薦"],
    ["/looks/柔和精緻妝", "柔和精緻妝", "柔光裸妝"],
    ["/looks/自然妝", "自然妝", "日系妝容"],
    ["/looks/偽素顏", "偽素顏妝", "裸妝"],
    ["/looks/水光肌", "水光肌妝容", "清透妝"],
    ["/looks/玻璃肌", "玻璃肌妝容", "韓系妝容"],
    ["/looks/低飽和", "Clean Girl 妝", "低飽和妝容"],
    ["/scenarios/面試", "面試妝", "面試化妝技巧"],
    ["/scenarios/通勤", "通勤妝", "上班妝"],
    ["/scenarios/初次約會", "約會妝", "情人節妝容"],
    ["/scenarios/證件照", "證件照妝", "畢業照妝容"],
    ["/scenarios/婚禮賓客", "婚禮賓客妝", "氛圍感妝容"],
    ["/scenarios/畢業舞會", "畢業舞會妝", "畢業照妝容"],
  ],
  es: [
    [
      "/probador-maquillaje-ia",
      "probador de maquillaje con IA",
      "prueba de maquillaje virtual",
    ],
    [
      "/app-maquillaje-virtual",
      "prueba de maquillaje virtual",
      "simulador de maquillaje",
    ],
    ["/looks/soft-glam", "maquillaje soft glam", "maquillaje elegante"],
    ["/looks/maquillaje-natural", "maquillaje natural", "maquillaje de día"],
    ["/looks/sin-maquillaje", "maquillaje sin maquillaje", "maquillaje nude"],
    ["/looks/piel-luminosa", "maquillaje glow", "piel luminosa"],
    ["/looks/glass-skin", "maquillaje glass skin", "maquillaje glow"],
    ["/looks/clean-girl", "maquillaje clean girl", "maquillaje minimalista"],
    [
      "/scenarios/entrevista",
      "maquillaje para entrevista de trabajo",
      "maquillaje para fotos",
    ],
    [
      "/scenarios/oficina",
      "maquillaje para la oficina",
      "maquillaje para el trabajo",
    ],
    [
      "/scenarios/primera-cita",
      "maquillaje para primer encuentro",
      "maquillaje para una cita",
    ],
    [
      "/scenarios/foto-pasaporte",
      "maquillaje para foto de pasaporte",
      "maquillaje para fotos",
    ],
    [
      "/scenarios/boda-invitada",
      "maquillaje para boda de invitada",
      "maquillaje para fiesta",
    ],
    [
      "/scenarios/graduacion",
      "maquillaje para graduación",
      "maquillaje para fiesta",
    ],
  ],
  "pt-br": [
    [
      "/maquiagem-virtual-ia",
      "maquiagem virtual com IA",
      "teste de maquiagem virtual",
    ],
    [
      "/app-maquiagem-virtual",
      "teste de maquiagem virtual",
      "provador virtual de maquiagem",
    ],
    ["/looks/glam-suave", "maquiagem soft glam", "maquiagem elegante"],
    [
      "/looks/maquiagem-natural",
      "maquiagem natural",
      "maquiagem para o dia a dia",
    ],
    ["/looks/sem-maquiagem", "maquiagem sem maquiagem", "maquiagem leve"],
    ["/looks/pele-glow", "maquiagem glow", "pele glow"],
    ["/looks/wet-skin", "pele molhada", "maquiagem glow"],
    ["/looks/clean-girl", "maquiagem clean girl", "maquiagem para o dia a dia"],
    [
      "/scenarios/entrevista",
      "maquiagem para entrevista de emprego",
      "maquiagem para fotos",
    ],
    ["/scenarios/trabalho", "maquiagem para o trabalho", "make para o dia"],
    [
      "/scenarios/primeiro-encontro",
      "maquiagem para primeiro encontro",
      "maquiagem para encontro",
    ],
    [
      "/scenarios/foto-documento",
      "maquiagem para foto de documento",
      "maquiagem para fotos",
    ],
    [
      "/scenarios/casamento-convidada",
      "maquiagem para casamento convidada",
      "maquiagem para festa",
    ],
    [
      "/scenarios/formatura",
      "maquiagem para formatura",
      "maquiagem para festa",
    ],
  ],
};

for (const languageEntries of Object.values(rawKeywordsByLanguage)) {
  if (languageEntries.length !== footerSeoTargets.length) {
    throw new Error("Footer SEO keyword matrix must cover every target page.");
  }
}

const keywordsByLanguage = Object.fromEntries(
  Object.entries(rawKeywordsByLanguage).map(([language, entries]) => [
    language,
    entries.map(([path, keyword, secondaryKeyword]) => ({
      path,
      keyword,
      secondaryKeyword,
    })),
  ]),
) as unknown as Record<SeoLanguageSlug, readonly KeywordEntry[]>;

const eastAsianLanguages = new Set<SeoLanguageSlug>([
  "zh-cn",
  "zh-tw",
  "ja",
  "ko",
]);

const eastImageByPath: Record<string, string> = {
  "/ai-makeup-try-on": "/images/looks/korean-dewy-glow--east-asia.webp",
  "/virtual-makeup-app": "/images/looks/creator-camera-glow--east-asia.webp",
  "/looks/soft-glam": "/images/looks/refined--east-asia.webp",
  "/looks/natural-makeup": "/images/looks/warm-nude-daily--east-asia.webp",
  "/looks/no-makeup-makeup": "/images/looks/no-makeup--east-asia.webp",
  "/looks/dewy-skin": "/images/looks/korean-dewy-glow--east-asia.webp",
  "/looks/glass-skin": "/images/looks/korean-dewy-makeup--east-asia.webp",
  "/looks/clean-girl": "/images/looks/soft-matte-everyday--east-asia.webp",
  "/scenarios/interview": "/images/looks/interview-ready--east-asia.webp",
  "/scenarios/office": "/images/looks/commute--east-asia.webp",
  "/scenarios/first-date": "/images/looks/rose-milk-date--east-asia.webp",
  "/scenarios/passport-photo":
    "/images/looks/passport-photo-clean--east-asia.webp",
  "/scenarios/wedding-guest": "/images/looks/wedding-guest--east-asia.webp",
  "/scenarios/prom": "/images/looks/champagne-gala--east-asia.webp",
};

const globalImageByPath: Record<string, string> = {
  "/ai-makeup-try-on": "/images/article-ai-tryon-comparison.webp",
  "/virtual-makeup-app": "/images/article-ai-tryon-comparison.webp",
  "/looks/soft-glam": "/images/look-refined.webp",
  "/looks/natural-makeup": "/images/look-warm-nude-daily.webp",
  "/looks/no-makeup-makeup": "/images/look-no-makeup.webp",
  "/looks/dewy-skin": "/images/look-korean-dewy-glow.webp",
  "/looks/glass-skin": "/images/look-korean-dewy-makeup.webp",
  "/looks/clean-girl": "/images/look-soft-matte-everyday.webp",
  "/scenarios/interview": "/images/look-interview-ready.webp",
  "/scenarios/office": "/images/look-commute.webp",
  "/scenarios/first-date": "/images/look-date.webp",
  "/scenarios/passport-photo": "/images/look-passport-photo-clean.webp",
  "/scenarios/wedding-guest": "/images/look-wedding-guest.webp",
  "/scenarios/prom": "/images/look-champagne-gala.webp",
};

function assetFor(spec: KeywordSpec): string {
  const map = eastAsianLanguages.has(spec.languageSlug)
    ? eastImageByPath
    : globalImageByPath;
  return map[spec.englishPath] ?? "/images/article-ai-tryon-comparison.webp";
}

const copyByLanguage: Record<SeoLanguageSlug, LanguageCopy> = {
  "zh-cn": {
    faqHeading: "常见问题",
    relatedHeading: "继续探索",
    ctaLabel: "用我的自拍预览",
    title: (s) =>
      `${s.keyword}：${s.secondaryKeyword}选择指南 | AI Beauty Stylist`,
    description: (s) =>
      `${s.keyword}实用指南。结合${s.secondaryKeyword}、真实肤质、光线和使用场景，在购买或照着教程化妆前先完成预览与判断。`,
    heroSubtitle: (s) =>
      `不要只照搬模特效果。用自己的脸比较${s.keyword}，同时检查${s.secondaryKeyword}相关的颜色、妆感和场景适配。`,
    sectionTitle: (s) => `${s.keyword}首先要解决什么`,
    paragraphs: (s) => [
      `${s.keyword}不是简单增加产品数量，而是让底妆、眼妆、唇颊和场景形成一致判断。先明确想改善的区域，再决定颜色与强度。`,
      `${s.secondaryKeyword}可以提供搜索灵感，但最终应以自己的肤色、五官比例、皮肤状态和实际光线为准。`,
      `预览时同时观察近距离、正面照片和日常环境，避免只在滤镜或单一模特图上做决定。`,
    ],
    stepsTitle: (s) => `${s.keyword}的判断步骤`,
    steps: (s) => [
      {
        title: "先确定目标",
        body: `明确${s.keyword}需要解决的场景、妆感和完成时间。`,
      },
      {
        title: "比较两个方向",
        body: `围绕${s.secondaryKeyword}比较不同颜色、强度和质感。`,
      },
      {
        title: "用真实光线复核",
        body: "确认自拍、近距离和实际环境中都自然，再决定产品与教程。",
      },
    ],
    compareTitle: (s) => `${s.keyword}验收清单`,
    rows: () => [
      { label: "肤质", good: "保留真实皮肤细节", avoid: "滤镜感或厚重遮盖" },
      {
        label: "颜色",
        good: "与肤色、唇色和服装协调",
        avoid: "只照搬热门色号",
      },
      {
        label: "场景",
        good: "在目标光线与距离下成立",
        avoid: "只在模特图上好看",
      },
    ],
    highlight: (s) =>
      `${s.keyword}的目标不是复制别人，而是找到自己能够稳定复现的${s.secondaryKeyword}方向。`,
    ctaTitle: (s) => `先预览你的${s.keyword}`,
    ctaText: () =>
      "上传清晰自拍，比较适合自己的颜色、位置和妆感，再决定是否购买或跟随教程。",
    faq: (s) => [
      {
        q: `${s.keyword}适合我吗？`,
        a: `需要结合肤色、五官、皮肤状态和场景判断。AI 预览可以先比较${s.secondaryKeyword}的不同方向。`,
      },
      {
        q: `做${s.keyword}最容易出错在哪里？`,
        a: "常见问题是只看模特图、忽略真实光线，或一次加入太多颜色和质感。",
      },
      {
        q: `如何让${s.keyword}更接近可执行参考？`,
        a: "使用无滤镜、正面、光线均匀的自拍，并在近距离和日常环境中复核。",
      },
    ],
  },
  "zh-tw": {
    faqHeading: "常見問題",
    relatedHeading: "繼續探索",
    ctaLabel: "用我的自拍預覽",
    title: (s) =>
      `${s.keyword}：${s.secondaryKeyword}選擇指南 | AI Beauty Stylist`,
    description: (s) =>
      `${s.keyword}實用指南。結合${s.secondaryKeyword}、真實膚質、光線與場合，在購買或跟教學前先預覽與判斷。`,
    heroSubtitle: (s) =>
      `不要只複製模特兒效果。用自己的臉比較${s.keyword}，同時檢查${s.secondaryKeyword}相關的顏色、妝感與場合。`,
    sectionTitle: (s) => `${s.keyword}先要解決什麼`,
    paragraphs: (s) => [
      `${s.keyword}不是增加產品數量，而是讓底妝、眼妝、唇頰與場合形成一致判斷。`,
      `${s.secondaryKeyword}可以提供靈感，但最後仍要以自己的膚色、五官比例、膚況與真實光線為準。`,
      `預覽時同時觀察近距離、正面照片與日常環境，避免只在濾鏡或單一模特兒圖片上決定。`,
    ],
    stepsTitle: (s) => `${s.keyword}判斷步驟`,
    steps: (s) => [
      {
        title: "先確定目標",
        body: `明確${s.keyword}要處理的場合、妝感與完成時間。`,
      },
      {
        title: "比較兩個方向",
        body: `圍繞${s.secondaryKeyword}比較顏色、強度與質感。`,
      },
      {
        title: "用真實光線複核",
        body: "確認自拍、近距離和實際環境中都自然，再決定產品與教學。",
      },
    ],
    compareTitle: (s) => `${s.keyword}驗收清單`,
    rows: () => [
      { label: "膚質", good: "保留真實皮膚細節", avoid: "濾鏡感或厚重遮蓋" },
      {
        label: "顏色",
        good: "與膚色、唇色和服裝協調",
        avoid: "只複製熱門色號",
      },
      {
        label: "場合",
        good: "在目標光線與距離下成立",
        avoid: "只在模特兒圖片上好看",
      },
    ],
    highlight: (s) =>
      `${s.keyword}的目標不是複製別人，而是找到自己能穩定重現的${s.secondaryKeyword}方向。`,
    ctaTitle: (s) => `先預覽你的${s.keyword}`,
    ctaText: () =>
      "上傳清晰自拍，比較適合自己的顏色、位置與妝感，再決定是否購買或跟教學。",
    faq: (s) => [
      {
        q: `${s.keyword}適合我嗎？`,
        a: `需要結合膚色、五官、膚況和場合判斷。AI 預覽可以先比較${s.secondaryKeyword}的不同方向。`,
      },
      {
        q: `做${s.keyword}最容易錯在哪裡？`,
        a: "常見問題是只看模特兒圖片、忽略真實光線，或一次加入太多顏色與質感。",
      },
      {
        q: `如何讓${s.keyword}更接近真實效果？`,
        a: "使用無濾鏡、正面、光線均勻的自拍，並在近距離與日常環境中複核。",
      },
    ],
  },
  de: {
    faqHeading: "Häufige Fragen",
    relatedHeading: "Weitere passende Seiten",
    ctaLabel: "Auf meinem Selfie testen",
    title: (s) =>
      `${s.keyword}: ${s.secondaryKeyword} richtig auswählen | AI Beauty Stylist`,
    description: (s) =>
      `Praxisguide für ${s.keyword}: Vergleiche ${s.secondaryKeyword}, Farben, Finish und Licht auf deinem eigenen Gesicht, bevor du Produkte kaufst.`,
    heroSubtitle: (s) =>
      `Prüfe ${s.keyword} auf deinem Gesicht statt nur auf einem Modell. So kannst du ${s.secondaryKeyword}, Intensität und Anlass realistisch vergleichen.`,
    sectionTitle: (s) => `Was ${s.keyword} leisten sollte`,
    paragraphs: (s) => [
      `${s.keyword} funktioniert am besten, wenn Teint, Augen, Lippen und Anlass als eine Entscheidung betrachtet werden.`,
      `${s.secondaryKeyword} liefert eine gute Suchrichtung, muss aber zu Unterton, Gesichtszügen, Hautzustand und echtem Licht passen.`,
      `Vergleiche Nahansicht, Frontfoto und Alltagssituation, damit das Ergebnis nicht nur in einem gefilterten Referenzbild überzeugt.`,
    ],
    stepsTitle: (s) => `${s.keyword} in drei Schritten prüfen`,
    steps: (s) => [
      {
        title: "Ziel festlegen",
        body: `Bestimme Anlass, Wirkung und Zeitrahmen für ${s.keyword}.`,
      },
      {
        title: "Zwei Richtungen vergleichen",
        body: `Teste Farben, Intensität und Finish rund um ${s.secondaryKeyword}.`,
      },
      {
        title: "Im echten Licht prüfen",
        body: "Entscheide erst, wenn Selfie, Nahansicht und Alltagssituation stimmig sind.",
      },
    ],
    compareTitle: (s) => `Checkliste für ${s.keyword}`,
    rows: () => [
      {
        label: "Haut",
        good: "Echte Textur bleibt sichtbar",
        avoid: "Filtereffekt oder schwere Schichten",
      },
      {
        label: "Farbe",
        good: "Passt zu Unterton und Kleidung",
        avoid: "Nur Trendfarben kopieren",
      },
      {
        label: "Anlass",
        good: "Funktioniert im Ziellicht",
        avoid: "Sieht nur am Modell gut aus",
      },
    ],
    highlight: (s) =>
      `${s.keyword} soll nicht kopiert, sondern als tragbare ${s.secondaryKeyword}-Richtung für dein Gesicht übersetzt werden.`,
    ctaTitle: (s) => `${s.keyword} zuerst ansehen`,
    ctaText: () =>
      "Lade ein klares Selfie hoch und vergleiche Farbe, Platzierung und Finish vor dem Kauf.",
    faq: (s) => [
      {
        q: `Passt ${s.keyword} zu mir?`,
        a: `Das hängt von Unterton, Gesichtszügen, Hautzustand und Anlass ab. Eine Vorschau hilft, Varianten von ${s.secondaryKeyword} zu vergleichen.`,
      },
      {
        q: `Was ist der häufigste Fehler bei ${s.keyword}?`,
        a: "Nur ein Modellbild zu kopieren und echtes Licht oder die eigene Hauttextur zu ignorieren.",
      },
      {
        q: `Wie wirkt ${s.keyword} realistischer?`,
        a: "Nutze ein ungefiltertes Frontfoto bei gleichmäßigem Licht und prüfe das Ergebnis auch aus der Nähe.",
      },
    ],
  },
  fr: {
    faqHeading: "Questions fréquentes",
    relatedHeading: "Pages à découvrir",
    ctaLabel: "Tester sur mon selfie",
    title: (s) =>
      `${s.keyword} : choisir la bonne direction ${s.secondaryKeyword} | AI Beauty Stylist`,
    description: (s) =>
      `Guide pratique de ${s.keyword} : comparez ${s.secondaryKeyword}, couleurs, fini et lumière sur votre visage avant d'acheter ou de suivre un tutoriel.`,
    heroSubtitle: (s) =>
      `Évaluez ${s.keyword} sur votre propre visage plutôt que sur un modèle, puis comparez ${s.secondaryKeyword}, intensité et contexte réel.`,
    sectionTitle: (s) => `Ce que ${s.keyword} doit résoudre`,
    paragraphs: (s) => [
      `${s.keyword} fonctionne lorsque le teint, les yeux, les lèvres et l'occasion racontent la même chose.`,
      `${s.secondaryKeyword} donne une direction utile, mais le sous-ton, les traits, l'état de la peau et la lumière réelle décident du résultat.`,
      `Comparez une vue rapprochée, une photo de face et la situation d'usage pour éviter un choix qui ne marche que sur une image filtrée.`,
    ],
    stepsTitle: (s) => `Évaluer ${s.keyword} en trois étapes`,
    steps: (s) => [
      {
        title: "Définir l'objectif",
        body: `Précisez l'occasion, l'effet et le temps disponible pour ${s.keyword}.`,
      },
      {
        title: "Comparer deux directions",
        body: `Testez couleur, intensité et fini autour de ${s.secondaryKeyword}.`,
      },
      {
        title: "Vérifier en lumière réelle",
        body: "Décidez après avoir contrôlé selfie, proximité et contexte quotidien.",
      },
    ],
    compareTitle: (s) => `Checklist ${s.keyword}`,
    rows: () => [
      {
        label: "Peau",
        good: "Texture réelle visible",
        avoid: "Effet filtre ou couches épaisses",
      },
      {
        label: "Couleur",
        good: "Accord avec sous-ton et tenue",
        avoid: "Copier seulement une tendance",
      },
      {
        label: "Contexte",
        good: "Fonctionne dans la bonne lumière",
        avoid: "Convient seulement au modèle",
      },
    ],
    highlight: (s) =>
      `${s.keyword} doit traduire ${s.secondaryKeyword} pour votre visage, pas reproduire exactement le maquillage de quelqu'un d'autre.`,
    ctaTitle: (s) => `Prévisualiser ${s.keyword}`,
    ctaText: () =>
      "Importez un selfie clair et comparez couleur, placement et fini avant de choisir.",
    faq: (s) => [
      {
        q: `${s.keyword} me convient-il ?`,
        a: `Cela dépend du sous-ton, des traits, de la peau et de l'occasion. Une prévisualisation permet de comparer plusieurs directions ${s.secondaryKeyword}.`,
      },
      {
        q: `Quelle erreur éviter avec ${s.keyword} ?`,
        a: "Copier une photo de modèle sans vérifier la lumière réelle ni sa propre texture de peau.",
      },
      {
        q: `Comment rendre ${s.keyword} plus réaliste ?`,
        a: "Utilisez une photo de face sans filtre, avec une lumière régulière, puis vérifiez le résultat de près.",
      },
    ],
  },
  ja: {
    faqHeading: "よくある質問",
    relatedHeading: "あわせて見たいページ",
    ctaLabel: "自分の写真で試す",
    title: (s) =>
      `${s.keyword}：${s.secondaryKeyword}を自分の顔で選ぶ | AI Beauty Stylist`,
    description: (s) =>
      `${s.keyword}の実用ガイド。${s.secondaryKeyword}、色、質感、光の見え方を自分の顔で比較し、購入や練習の前に方向を決めます。`,
    heroSubtitle: (s) =>
      `モデル画像をそのまま真似せず、自分の顔で${s.keyword}を比較。${s.secondaryKeyword}の色、強さ、シーン適性まで確認します。`,
    sectionTitle: (s) => `${s.keyword}で最初に確認すること`,
    paragraphs: (s) => [
      `${s.keyword}は、ベース、目元、唇、チーク、使う場面が一つの印象につながると成功しやすくなります。`,
      `${s.secondaryKeyword}は検索のヒントになりますが、肌色、顔立ち、肌状態、実際の光で調整する必要があります。`,
      `近距離、正面写真、日常の環境を同時に確認し、フィルター画像だけで判断しないことが大切です。`,
    ],
    stepsTitle: (s) => `${s.keyword}を選ぶ3ステップ`,
    steps: (s) => [
      {
        title: "目的を決める",
        body: `${s.keyword}で必要な場面、印象、準備時間を決めます。`,
      },
      {
        title: "2方向を比較する",
        body: `${s.secondaryKeyword}を軸に、色、強さ、質感を比べます。`,
      },
      {
        title: "実際の光で確認する",
        body: "セルフィー、近距離、日常環境で自然に見えてから決めます。",
      },
    ],
    compareTitle: (s) => `${s.keyword}の確認リスト`,
    rows: () => [
      { label: "肌", good: "本来の肌質が残る", avoid: "フィルター感や厚塗り" },
      {
        label: "色",
        good: "肌色と服に調和する",
        avoid: "流行色だけをコピーする",
      },
      {
        label: "場面",
        good: "目的の光と距離で自然",
        avoid: "モデル画像だけで成立する",
      },
    ],
    highlight: (s) =>
      `${s.keyword}は誰かをコピーするためではなく、自分で再現できる${s.secondaryKeyword}の方向を見つけるためのものです。`,
    ctaTitle: (s) => `${s.keyword}を先にプレビュー`,
    ctaText: () =>
      "明るく正面から撮ったセルフィーで、色、位置、質感を比較してから選びましょう。",
    faq: (s) => [
      {
        q: `${s.keyword}は自分に似合いますか？`,
        a: `肌色、顔立ち、肌状態、場面で変わります。AIプレビューで${s.secondaryKeyword}の方向を比較できます。`,
      },
      {
        q: `${s.keyword}で失敗しやすい点は？`,
        a: "モデル画像だけを真似し、実際の光や自分の肌質を確認しないことです。",
      },
      {
        q: `${s.keyword}を自然に見せるには？`,
        a: "フィルターなしの正面写真を使い、近距離と日常光でも確認してください。",
      },
    ],
  },
  ko: {
    faqHeading: "자주 묻는 질문",
    relatedHeading: "함께 보면 좋은 페이지",
    ctaLabel: "내 셀피로 미리보기",
    title: (s) =>
      `${s.keyword}: ${s.secondaryKeyword}를 내 얼굴에 맞게 선택하기 | AI Beauty Stylist`,
    description: (s) =>
      `${s.keyword} 실전 가이드입니다. ${s.secondaryKeyword}, 색, 질감, 조명을 내 얼굴에서 비교하고 구매나 연습 전에 방향을 정하세요.`,
    heroSubtitle: (s) =>
      `모델 사진을 그대로 따라 하지 말고 내 얼굴에서 ${s.keyword}를 비교하세요. ${s.secondaryKeyword}의 색, 강도, 상황 적합성도 함께 확인합니다.`,
    sectionTitle: (s) => `${s.keyword}에서 먼저 확인할 것`,
    paragraphs: (s) => [
      `${s.keyword}는 베이스, 눈, 입술, 치크와 사용하는 상황이 하나의 인상으로 연결될 때 자연스럽습니다.`,
      `${s.secondaryKeyword}는 좋은 검색 방향이지만 피부 톤, 얼굴 특징, 피부 상태와 실제 조명에 맞게 조정해야 합니다.`,
      `가까운 거리, 정면 사진, 일상 환경을 함께 확인해 필터 사진에서만 좋아 보이는 선택을 피하세요.`,
    ],
    stepsTitle: (s) => `${s.keyword} 선택 3단계`,
    steps: (s) => [
      {
        title: "목표 정하기",
        body: `${s.keyword}에 필요한 상황, 인상, 준비 시간을 정합니다.`,
      },
      {
        title: "두 방향 비교하기",
        body: `${s.secondaryKeyword}를 기준으로 색, 강도, 질감을 비교합니다.`,
      },
      {
        title: "실제 조명에서 확인하기",
        body: "셀피, 가까운 거리, 일상 환경에서 자연스러운지 확인한 뒤 결정합니다.",
      },
    ],
    compareTitle: (s) => `${s.keyword} 확인 목록`,
    rows: () => [
      {
        label: "피부",
        good: "실제 피부결이 남음",
        avoid: "필터 느낌이나 두꺼운 커버",
      },
      {
        label: "색",
        good: "피부 톤과 옷에 조화로움",
        avoid: "유행 색만 그대로 복사",
      },
      {
        label: "상황",
        good: "목표 조명과 거리에서 자연스러움",
        avoid: "모델 사진에서만 어울림",
      },
    ],
    highlight: (s) =>
      `${s.keyword}의 목표는 다른 사람을 복사하는 것이 아니라 내가 반복할 수 있는 ${s.secondaryKeyword} 방향을 찾는 것입니다.`,
    ctaTitle: (s) => `${s.keyword} 먼저 미리보기`,
    ctaText: () =>
      "밝은 정면 셀피로 색, 위치, 질감을 비교한 뒤 제품과 튜토리얼을 선택하세요.",
    faq: (s) => [
      {
        q: `${s.keyword}가 나에게 어울리나요?`,
        a: `피부 톤, 얼굴 특징, 피부 상태와 상황에 따라 달라집니다. AI 미리보기로 ${s.secondaryKeyword} 방향을 비교할 수 있습니다.`,
      },
      {
        q: `${s.keyword}에서 자주 하는 실수는 무엇인가요?`,
        a: "모델 사진만 따라 하고 실제 조명이나 자신의 피부결을 확인하지 않는 것입니다.",
      },
      {
        q: `${s.keyword}를 자연스럽게 보이게 하려면?`,
        a: "필터 없는 정면 셀피를 사용하고 가까운 거리와 일상 조명에서도 확인하세요.",
      },
    ],
  },
  es: {
    faqHeading: "Preguntas frecuentes",
    relatedHeading: "También te puede interesar",
    ctaLabel: "Probar en mi selfie",
    title: (s) =>
      `${s.keyword}: cómo elegir ${s.secondaryKeyword} para tu rostro | AI Beauty Stylist`,
    description: (s) =>
      `Guía práctica de ${s.keyword}: compara ${s.secondaryKeyword}, color, acabado y luz en tu rostro antes de comprar o seguir un tutorial.`,
    heroSubtitle: (s) =>
      `Evalúa ${s.keyword} en tu propia cara en lugar de copiar una modelo. Compara también ${s.secondaryKeyword}, intensidad y contexto real.`,
    sectionTitle: (s) => `Qué debe resolver ${s.keyword}`,
    paragraphs: (s) => [
      `${s.keyword} funciona cuando piel, ojos, labios, mejillas y ocasión construyen una sola decisión.`,
      `${s.secondaryKeyword} ofrece una dirección de búsqueda útil, pero el subtono, los rasgos, el estado de la piel y la luz real cambian el resultado.`,
      `Compara distancia corta, foto frontal y situación de uso para evitar una elección que solo funciona en una imagen filtrada.`,
    ],
    stepsTitle: (s) => `Evaluar ${s.keyword} en tres pasos`,
    steps: (s) => [
      {
        title: "Definir el objetivo",
        body: `Aclara la ocasión, el efecto y el tiempo disponible para ${s.keyword}.`,
      },
      {
        title: "Comparar dos direcciones",
        body: `Prueba color, intensidad y acabado alrededor de ${s.secondaryKeyword}.`,
      },
      {
        title: "Revisar con luz real",
        body: "Decide después de comprobar selfie, cercanía y contexto cotidiano.",
      },
    ],
    compareTitle: (s) => `Checklist de ${s.keyword}`,
    rows: () => [
      {
        label: "Piel",
        good: "Conserva textura real",
        avoid: "Filtro o capas pesadas",
      },
      {
        label: "Color",
        good: "Combina con subtono y ropa",
        avoid: "Copiar solo una tendencia",
      },
      {
        label: "Contexto",
        good: "Funciona con la luz objetivo",
        avoid: "Solo favorece a la modelo",
      },
    ],
    highlight: (s) =>
      `${s.keyword} debe traducir ${s.secondaryKeyword} a tu rostro, no copiar exactamente el maquillaje de otra persona.`,
    ctaTitle: (s) => `Previsualiza ${s.keyword}`,
    ctaText: () =>
      "Sube una selfie clara y compara color, colocación y acabado antes de elegir.",
    faq: (s) => [
      {
        q: `¿Me favorece ${s.keyword}?`,
        a: `Depende del subtono, los rasgos, la piel y la ocasión. Una vista previa ayuda a comparar direcciones de ${s.secondaryKeyword}.`,
      },
      {
        q: `¿Qué error debo evitar con ${s.keyword}?`,
        a: "Copiar una foto de modelo sin revisar la luz real ni la textura de tu piel.",
      },
      {
        q: `¿Cómo hacer que ${s.keyword} se vea más realista?`,
        a: "Usa una foto frontal sin filtro, con luz uniforme, y revisa el resultado de cerca.",
      },
    ],
  },
  "pt-br": {
    faqHeading: "Perguntas frequentes",
    relatedHeading: "Veja também",
    ctaLabel: "Testar na minha selfie",
    title: (s) =>
      `${s.keyword}: como escolher ${s.secondaryKeyword} para seu rosto | AI Beauty Stylist`,
    description: (s) =>
      `Guia prático de ${s.keyword}: compare ${s.secondaryKeyword}, cor, acabamento e luz no seu rosto antes de comprar ou seguir tutorial.`,
    heroSubtitle: (s) =>
      `Avalie ${s.keyword} no seu próprio rosto em vez de copiar uma modelo. Compare também ${s.secondaryKeyword}, intensidade e contexto real.`,
    sectionTitle: (s) => `O que ${s.keyword} precisa resolver`,
    paragraphs: (s) => [
      `${s.keyword} funciona quando pele, olhos, boca, blush e ocasião formam uma única decisão.`,
      `${s.secondaryKeyword} oferece uma boa direção de busca, mas subtom, traços, estado da pele e luz real mudam o resultado.`,
      `Compare distância curta, foto frontal e situação de uso para evitar uma escolha que só funciona em imagem filtrada.`,
    ],
    stepsTitle: (s) => `Avaliar ${s.keyword} em três passos`,
    steps: (s) => [
      {
        title: "Definir o objetivo",
        body: `Determine ocasião, efeito e tempo disponível para ${s.keyword}.`,
      },
      {
        title: "Comparar duas direções",
        body: `Teste cor, intensidade e acabamento em torno de ${s.secondaryKeyword}.`,
      },
      {
        title: "Revisar na luz real",
        body: "Decida depois de conferir selfie, proximidade e contexto do dia a dia.",
      },
    ],
    compareTitle: (s) => `Checklist de ${s.keyword}`,
    rows: () => [
      {
        label: "Pele",
        good: "Mantém textura real",
        avoid: "Filtro ou camadas pesadas",
      },
      {
        label: "Cor",
        good: "Combina com subtom e roupa",
        avoid: "Copiar só uma tendência",
      },
      {
        label: "Contexto",
        good: "Funciona na luz desejada",
        avoid: "Só favorece a modelo",
      },
    ],
    highlight: (s) =>
      `${s.keyword} deve traduzir ${s.secondaryKeyword} para seu rosto, não copiar exatamente a maquiagem de outra pessoa.`,
    ctaTitle: (s) => `Pré-visualize ${s.keyword}`,
    ctaText: () =>
      "Envie uma selfie clara e compare cor, posição e acabamento antes de escolher.",
    faq: (s) => [
      {
        q: `${s.keyword} combina comigo?`,
        a: `Depende do subtom, dos traços, da pele e da ocasião. A prévia ajuda a comparar direções de ${s.secondaryKeyword}.`,
      },
      {
        q: `Qual erro evitar com ${s.keyword}?`,
        a: "Copiar uma foto de modelo sem conferir a luz real e a textura da sua pele.",
      },
      {
        q: `Como deixar ${s.keyword} mais realista?`,
        a: "Use uma foto frontal sem filtro, com luz uniforme, e confira o resultado de perto.",
      },
    ],
  },
};

function relatedLinks(spec: KeywordSpec) {
  const supplementalLinks: Record<
    string,
    readonly { label: string; url: string }[]
  > = {
    "de:/scenarios/wedding-guest": [
      { label: "Braut Make-up", url: "/scenarios/braut" },
    ],
    "es:/looks/natural-makeup": [
      { label: "maquillaje de día", url: "/scenarios/dia" },
    ],
    "es:/looks/dewy-skin": [
      { label: "maquillaje para piel grasa", url: "/for/piel-grasa" },
    ],
    "es:/looks/soft-glam": [
      { label: "maquillaje de noche", url: "/scenarios/noche" },
    ],
  };
  const siblingPaths = footerSeoTargets
    .filter(
      (target) =>
        target.category === spec.category &&
        target.englishPath !== spec.englishPath,
    )
    .slice(0, 2)
    .map((target) => {
      const targetIndex = footerSeoTargets.findIndex(
        (candidate) => candidate.englishPath === target.englishPath,
      );
      const localizedKeyword =
        keywordsByLanguage[spec.languageSlug][targetIndex]?.keyword;
      return {
        label: localizedKeyword ?? target.englishPath,
        url: target.englishPath,
      };
    });

  return [
    { label: spec.secondaryKeyword, url: "/tryon-free" },
    ...(supplementalLinks[`${spec.languageSlug}:${spec.englishPath}`] ?? []),
    ...siblingPaths,
    { label: "AI Beauty Stylist", url: "/discover" },
  ];
}

function makePage(spec: KeywordSpec): LocalizedSeoPage {
  const copy = copyByLanguage[spec.languageSlug];
  const heroImage = assetFor(spec);
  const depth = buildFooterSeoDepth({
    ...spec,
    topic: spec.secondaryKeyword,
  });
  return {
    languageSlug: spec.languageSlug,
    groupKey: `footer:${spec.englishPath}`,
    path: spec.path,
    englishPath: spec.englishPath,
    category: spec.category,
    keyword: spec.keyword,
    topic: spec.secondaryKeyword,
    title: copy.title(spec),
    description: copy.description(spec),
    heroTitle: spec.keyword,
    heroSubtitle: copy.heroSubtitle(spec),
    heroImage,
    ogImage: heroImage,
    contentAssetsHeading: depth.contentAssetsHeading,
    contentAssets: depth.contentAssets,
    ctaTitle: copy.ctaTitle(spec),
    ctaText: copy.ctaText(spec),
    ctaLabel: copy.ctaLabel,
    faqHeading: copy.faqHeading,
    relatedHeading: copy.relatedHeading,
    sections: depth.sections,
    faq: depth.faq,
    relatedLinks: relatedLinks(spec),
    priority: spec.category === "product" ? "0.8" : "0.7",
    changefreq: "monthly",
  };
}

export const localizedFooterSeoPages: readonly LocalizedSeoPage[] = (
  Object.entries(keywordsByLanguage) as readonly [
    SeoLanguageSlug,
    readonly KeywordEntry[],
  ][]
).flatMap(([languageSlug, entries]) =>
  footerSeoTargets.map((target, index) =>
    makePage({
      ...target,
      ...entries[index]!,
      languageSlug,
    }),
  ),
);
