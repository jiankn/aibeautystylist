#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const REPORT_DIR = path.join(ROOT, "reports");
const TMP_DIR = path.join(ROOT, "tmp");
const REPORT_DATE = "2026-06-21";

const LANG_TO_SLUG = {
  en: "",
  de: "de",
  fr: "fr",
  ja: "ja",
  ko: "ko",
  "zh-TW": "zh-tw",
  es: "es",
  "pt-BR": "pt-br",
};

const LANG_LABELS = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  ja: "日本語",
  ko: "한국어",
  "zh-TW": "繁體中文",
  es: "Español",
  "pt-BR": "Português do Brasil",
};

const TARGET_LANGS = Object.keys(LANG_TO_SLUG);

const SEARCH_VOLUME_MIN_STANDALONE = 100;
const SEARCH_VOLUME_MIN_CLUSTER = 300;
const KD_MAX_STANDALONE = 25;

const ALIASES = {
  "ja:@cosme ランキング": ["アットコスメ ランキング", "cosme ランキング"],
  "pt-BR:maquiagem glow / pele glow": ["maquiagem glow", "pele glow"],
  "pt-BR:pele molhada / wet skin": ["pele molhada", "wet skin makeup"],
  "pt-BR:maquiagem para encontro / primeiro encontro": [
    "maquiagem para encontro",
    "maquiagem para primeiro encontro",
  ],
  "pt-BR:maquiagem para casamento (convidada)": [
    "maquiagem para casamento convidada",
  ],
  "pt-BR:maquiagem para Réveillon / Ano Novo": [
    "maquiagem para Réveillon",
    "maquiagem para Ano Novo",
  ],
  "pt-BR:maquiagem para passaporte / foto 3x4": [
    "maquiagem para passaporte",
    "maquiagem para foto 3x4",
  ],
  "pt-BR:teste de maquiagem IA / virtual": [
    "teste de maquiagem IA",
    "teste de maquiagem virtual",
  ],
  "pt-BR:maquiagem Vult / Quem Disse Berenice": [
    "maquiagem Vult",
    "maquiagem Quem Disse Berenice",
  ],
};

const ROLLOUT_CLUSTERS = [
  {
    phase: "P0",
    lang: "en",
    route: "/ai-makeup-try-on",
    action: "optimize-existing",
    primary: "what makeup looks good on me",
    keywords: [
      "what makeup looks good on me",
      "what makeup suits me",
      "AI makeup app",
      "AI makeup try-on",
      "virtual makeover",
      "before and after makeup",
    ],
    intent: "self-diagnosis-to-try-on",
    job: "Upload a selfie, answer what makeup fits my face, and start a try-on.",
    conversion: "Free try-on CTA + diagnosis save CTA",
    implementation: "src/pages/ai-makeup-try-on.astro",
  },
  {
    phase: "P0",
    lang: "en",
    route: "/for/hooded-eyes",
    action: "optimize-existing",
    primary: "makeup for hooded eyes",
    keywords: ["makeup for hooded eyes", "best mascara for hooded eyes"],
    intent: "face-feature-solution",
    job: "Show specific techniques and invite users to preview them on their own eyes.",
    conversion: "Try this look on your face",
    implementation: "src/pages/for/hooded-eyes.astro",
  },
  {
    phase: "P1",
    lang: "en",
    route: "/looks/natural-makeup",
    action: "optimize-existing",
    primary: "natural makeup look",
    keywords: ["natural makeup look", "how to do natural makeup"],
    intent: "style-planning",
    job: "Turn broad natural makeup demand into a personalized look selector.",
    conversion: "Preview natural looks",
    implementation: "src/pages/looks/natural-makeup.astro",
  },
  {
    phase: "P1",
    lang: "en",
    route: "/guides/apply-step-by-step",
    action: "optimize-existing",
    primary: "makeup order of application",
    keywords: [
      "makeup order of application",
      "how to apply makeup step by step",
    ],
    intent: "beginner-process",
    job: "Explain sequence, then send users to try the final look.",
    conversion: "Build my routine",
    implementation: "src/pages/guides/apply-step-by-step.astro",
  },
  {
    phase: "P1",
    lang: "en",
    route: "/for/mature-skin",
    action: "optimize-existing",
    primary: "makeup for mature skin",
    keywords: ["makeup for mature skin"],
    intent: "demographic-solution",
    job: "Reduce texture-heavy mistakes and preview lighter finishes.",
    conversion: "Preview mature-skin friendly looks",
    implementation: "src/pages/for/mature-skin.astro",
  },
  {
    phase: "P1",
    lang: "en",
    route: "/for/olive-skin",
    action: "optimize-existing",
    primary: "makeup for olive skin tone",
    keywords: ["makeup for olive skin tone"],
    intent: "undertone-solution",
    job: "Help users choose colors that do not turn grey or orange.",
    conversion: "Find my undertone colors",
    implementation: "src/pages/for/olive-skin.astro",
  },
  {
    phase: "P1",
    lang: "en",
    route: "/scenarios/passport-photo",
    action: "optimize-existing",
    primary: "passport photo makeup",
    keywords: ["passport photo makeup", "interview makeup"],
    intent: "photo-scenario",
    job: "Make camera-safe makeup practical and previewable.",
    conversion: "Check it on my selfie",
    implementation: "src/pages/scenarios/passport-photo.astro",
  },
  {
    phase: "P1",
    lang: "de",
    route: "/for/reife-haut",
    action: "optimize-existing",
    primary: "Make-up für reife Haut",
    keywords: ["Make-up für reife Haut"],
    intent: "demographic-solution",
    job: "Show lighter texture choices and AI preview for mature skin.",
    conversion: "Look auf meinem Gesicht testen",
    implementation: "src/i18n/localizedSeoPages.ts",
  },
  {
    phase: "P1",
    lang: "de",
    route: "/for/hauttyp-bestimmen",
    action: "optimize-existing",
    primary: "welche Farbe steht mir",
    keywords: [
      "welche Farbe steht mir",
      "Unterton Haut bestimmen",
      "welches Make-up passt zu mir",
      "Hautanalyse KI",
    ],
    intent: "color-diagnosis",
    job: "Turn color/undertone searches into diagnosis and saved recommendations.",
    conversion: "Farben mit Selfie prüfen",
    implementation: "src/i18n/localizedSeoPages.ts",
  },
  {
    phase: "P1",
    lang: "de",
    route: "/tutorial",
    action: "optimize-existing",
    primary: "Make-up für Anfänger",
    keywords: ["Make-up für Anfänger", "Grundausstattung Make-up"],
    intent: "beginner-process",
    job: "Teach a simple routine and route users into try-on.",
    conversion: "Meine Routine testen",
    implementation: "src/i18n/localizedSeoPages.ts",
  },
  {
    phase: "P1",
    lang: "de",
    route: "/scenarios/braut",
    action: "create-page",
    primary: "Braut Make-up",
    keywords: ["Braut Make-up", "Hochzeit Make-up Gast"],
    intent: "wedding-scenario",
    job: "Create a wedding makeup page separate from guest makeup.",
    conversion: "Hochzeitslook testen",
    implementation: "src/i18n/localizedSeoPages.ts",
  },
  {
    phase: "P1",
    lang: "fr",
    route: "/looks/maquillage-naturel",
    action: "optimize-existing",
    primary: "maquillage naturel",
    keywords: ["maquillage naturel", "maquillage nude"],
    intent: "style-planning",
    job: "Convert natural/nude makeup search into a face-specific preview.",
    conversion: "Essayer un rendu naturel",
    implementation: "src/i18n/localizedSeoPages.ts",
  },
  {
    phase: "P1",
    lang: "fr",
    route: "/scenarios/mariage",
    action: "create-page",
    primary: "maquillage invité mariage",
    keywords: ["maquillage invité mariage", "maquillage mariée"],
    intent: "wedding-scenario",
    job: "Build wedding-intent content with camera and lighting guidance.",
    conversion: "Prévisualiser le look",
    implementation: "src/i18n/localizedSeoPages.ts",
  },
  {
    phase: "P1",
    lang: "fr",
    route: "/for/paupieres-tombantes",
    action: "optimize-existing",
    primary: "maquillage pour paupières tombantes",
    keywords: ["maquillage pour paupières tombantes"],
    intent: "face-feature-solution",
    job: "Solve hooded-eye placement and send to try-on.",
    conversion: "Tester sur mes yeux",
    implementation: "src/i18n/localizedSeoPages.ts",
  },
  {
    phase: "P1",
    lang: "fr",
    route: "/for/peau-mature",
    action: "optimize-existing",
    primary: "maquillage peau mature",
    keywords: ["maquillage peau mature", "maquillage peau sensible"],
    intent: "demographic-solution",
    job: "Recommend texture-light looks for mature/sensitive skin.",
    conversion: "Comparer les rendus",
    implementation: "src/i18n/localizedSeoPages.ts",
  },
  {
    phase: "P0",
    lang: "ja",
    route: "/for/パーソナルカラー",
    action: "create-or-repurpose",
    primary: "パーソナルカラー診断",
    keywords: [
      "パーソナルカラー診断",
      "パーソナルカラー",
      "パーソナルカラー 診断 無料",
      "似合う色 診断",
    ],
    intent: "color-diagnosis",
    job: "Move this intent away from pricing and make it a diagnosis landing page.",
    conversion: "写真で似合う色を確認",
    implementation: "src/i18n/localizedSeoPages.ts",
  },
  {
    phase: "P0",
    lang: "ja",
    route: "/for/顔タイプ",
    action: "create-page",
    primary: "顔タイプ診断",
    keywords: ["顔タイプ診断", "顔タイプ 診断 AI", "似合うメイク 診断"],
    intent: "face-diagnosis",
    job: "Explain face-type diagnosis, then route to AI makeup recommendations.",
    conversion: "顔タイプでメイクを見る",
    implementation: "src/i18n/localizedSeoPages.ts",
  },
  {
    phase: "P0",
    lang: "ja",
    route: "/guides/順番",
    action: "optimize-existing",
    primary: "メイク 順番",
    keywords: ["メイク 順番", "メイクのやり方", "メイクの基本"],
    intent: "beginner-process",
    job: "Own makeup-order demand and turn it into a repeatable routine.",
    conversion: "自分の手順を試す",
    implementation: "src/i18n/localizedSeoPages.ts",
  },
  {
    phase: "P0",
    lang: "ja",
    route: "/for/一重",
    action: "create-page",
    primary: "一重 メイク",
    keywords: ["一重 メイク", "奥二重 メイク", "涙袋メイク"],
    intent: "eye-shape-solution",
    job: "Group eye-shape makeup under a preview-first feature page.",
    conversion: "目元メイクを試す",
    implementation: "src/i18n/localizedSeoPages.ts",
  },
  {
    phase: "P1",
    lang: "ja",
    route: "/scenarios/証明写真",
    action: "optimize-existing",
    primary: "証明写真メイク",
    keywords: ["証明写真メイク", "写真映えメイク", "面接メイク"],
    intent: "photo-scenario",
    job: "Make camera-safe makeup actionable with before/after examples.",
    conversion: "写真用メイクを確認",
    implementation: "src/i18n/localizedSeoPages.ts",
  },
  {
    phase: "P1",
    lang: "ja",
    route: "/",
    action: "optimize-existing",
    primary: "AIメイク診断",
    keywords: ["AIメイク診断", "肌診断 AI", "バーチャルメイク"],
    intent: "ai-diagnosis",
    job: "Make the homepage a clear AI diagnosis and try-on entry.",
    conversion: "無料で診断する",
    implementation: "src/locales/ja.json",
  },
  {
    phase: "P0",
    lang: "ko",
    route: "/for/퍼스널컬러",
    action: "optimize-existing",
    primary: "퍼스널컬러 자가진단",
    keywords: ["퍼스널컬러 자가진단", "퍼스널컬러 테스트"],
    intent: "color-diagnosis",
    job: "Use the personal-color feature page as the real diagnosis entry, not pricing.",
    conversion: "셀피로 퍼스널컬러 확인",
    implementation: "src/i18n/localizedSeoPagesPhase3.ts",
  },
  {
    phase: "P1",
    lang: "ko",
    route: "/membership",
    action: "optimize-existing",
    primary: "얼굴형 분석",
    keywords: ["얼굴형 분석", "AI 피부 분석"],
    intent: "face-skin-analysis",
    job: "Route analysis searches into personalized recommendations.",
    conversion: "얼굴형으로 룩 보기",
    implementation: "src/i18n/localizedSeoPagesPhase3.ts",
  },
  {
    phase: "P1",
    lang: "ko",
    route: "/guides/메이크업-순서",
    action: "optimize-existing",
    primary: "메이크업 순서",
    keywords: ["메이크업 순서"],
    intent: "beginner-process",
    job: "Turn routine questions into a stable beginner workflow.",
    conversion: "내 루틴으로 미리보기",
    implementation: "src/i18n/localizedSeoPagesPhase3.ts",
  },
  {
    phase: "P1",
    lang: "ko",
    route: "/for/웜톤",
    action: "optimize-existing",
    primary: "봄웜 메이크업",
    keywords: ["봄웜 메이크업", "쿨톤 메이크업", "웜톤 메이크업"],
    intent: "undertone-solution",
    job: "Own warm/cool tone makeup searches with a try-on bridge.",
    conversion: "톤별 컬러 비교",
    implementation: "src/i18n/localizedSeoPagesPhase3.ts",
  },
  {
    phase: "P1",
    lang: "zh-TW",
    route: "/guides/步驟",
    action: "optimize-existing",
    primary: "化妝步驟",
    keywords: ["化妝步驟", "化妝順序", "新手化妝教學"],
    intent: "beginner-process",
    job: "Own makeup-order demand and route users to try-on.",
    conversion: "用我的臉預覽流程",
    implementation: "src/i18n/localizedSeoPagesPhase3.ts",
  },
  {
    phase: "P1",
    lang: "zh-TW",
    route: "/for/個人色彩",
    action: "optimize-existing",
    primary: "個人色彩",
    keywords: ["個人色彩", "個人色彩診斷"],
    intent: "color-diagnosis",
    job: "Connect color diagnosis to lipstick/blush recommendations.",
    conversion: "查看適合我的顏色",
    implementation: "src/i18n/localizedSeoPagesPhase3.ts",
  },
  {
    phase: "P2",
    lang: "zh-TW",
    route: "/for/適合我",
    action: "module-only",
    primary: "開架口紅推薦",
    keywords: ["開架口紅推薦", "不沾杯口紅", "寶雅口紅"],
    intent: "product-research",
    job: "Use as product-choice modules under color diagnosis, not doorway pages.",
    conversion: "用膚色挑口紅",
    implementation: "src/i18n/localizedSeoPagesPhase3.ts",
  },
  {
    phase: "P1",
    lang: "es",
    route: "/looks/maquillaje-natural",
    action: "optimize-existing",
    primary: "maquillaje natural",
    keywords: ["maquillaje natural", "maquillaje nude"],
    intent: "style-planning",
    job: "Own broad natural makeup demand and bridge to virtual try-on.",
    conversion: "Probar maquillaje natural",
    implementation: "src/i18n/localizedSeoPagesPhase4.ts",
  },
  {
    phase: "P1",
    lang: "es",
    route: "/scenarios/dia",
    action: "create-page",
    primary: "maquillaje de día",
    keywords: ["maquillaje de día", "maquillaje natural"],
    intent: "daily-scenario",
    job: "Own daytime makeup demand and route users to natural and glow previews.",
    conversion: "Probar look de día",
    implementation: "src/i18n/localizedSeoPagesPhase4.ts",
  },
  {
    phase: "P1",
    lang: "es",
    route: "/scenarios/noche",
    action: "create-page",
    primary: "maquillaje de noche",
    keywords: ["maquillaje de noche", "maquillaje para fiesta"],
    intent: "event-scenario",
    job: "Turn night and party makeup demand into camera-safe try-on decisions.",
    conversion: "Probar look de noche",
    implementation: "src/i18n/localizedSeoPagesPhase4.ts",
  },
  {
    phase: "P1",
    lang: "es",
    route: "/looks/piel-luminosa",
    action: "optimize-existing",
    primary: "maquillaje glow",
    keywords: ["maquillaje glow", "piel luminosa"],
    intent: "style-planning",
    job: "Own glow makeup demand while explaining oil-control boundaries.",
    conversion: "Comparar glow en mi piel",
    implementation: "src/i18n/localizedSeoPagesPhase4.ts",
  },
  {
    phase: "P1",
    lang: "es",
    route: "/guides/paso-a-paso",
    action: "optimize-existing",
    primary: "maquillaje paso a paso",
    keywords: [
      "maquillaje paso a paso",
      "orden de maquillaje",
      "maquillaje para principiantes",
      "maquillaje fácil y rápido",
    ],
    intent: "beginner-process",
    job: "Own beginner process demand and convert to routine preview.",
    conversion: "Crear mi rutina",
    implementation: "src/i18n/localizedSeoPagesPhase4.ts",
  },
  {
    phase: "P1",
    lang: "es",
    route: "/for/piel-madura",
    action: "optimize-existing",
    primary: "maquillaje para piel madura",
    keywords: ["maquillaje para piel madura"],
    intent: "skin-type-solution",
    job: "Make skin-type advice visual and personalized.",
    conversion: "Comparar acabado en mi piel",
    implementation: "src/i18n/localizedSeoPagesPhase4.ts",
  },
  {
    phase: "P1",
    lang: "es",
    route: "/for/piel-grasa",
    action: "create-page",
    primary: "maquillaje para piel grasa",
    keywords: ["maquillaje para piel grasa", "maquillaje mate"],
    intent: "skin-type-solution",
    job: "Separate oily-skin intent from mature-skin advice and route to matte/glow comparisons.",
    conversion: "Ver acabado para piel grasa",
    implementation: "src/i18n/localizedSeoPagesPhase4.ts",
  },
  {
    phase: "P1",
    lang: "es",
    route: "/scenarios/graduacion",
    action: "create-page",
    primary: "maquillaje para graduación",
    keywords: ["maquillaje para graduación", "maquillaje para fiesta"],
    intent: "event-scenario",
    job: "Event page with photo-safe makeup and try-on CTA.",
    conversion: "Probar look de evento",
    implementation: "src/i18n/localizedSeoPagesPhase4.ts",
  },
  {
    phase: "P0",
    lang: "pt-BR",
    route: "/scenarios/formatura",
    action: "create-page",
    primary: "maquiagem para formatura",
    keywords: ["maquiagem para formatura"],
    intent: "event-scenario",
    job: "High-demand event page with camera and longevity guidance.",
    conversion: "Testar look de formatura",
    implementation: "src/i18n/localizedSeoPagesPhase4.ts",
  },
  {
    phase: "P0",
    lang: "pt-BR",
    route: "/for/colorimetria",
    action: "create-page",
    primary: "colorimetria pessoal",
    keywords: ["colorimetria pessoal", "cartela de cores pessoal"],
    intent: "color-diagnosis",
    job: "Convert colorimetry demand into AI color and makeup recommendations.",
    conversion: "Descobrir minha cartela",
    implementation: "src/i18n/localizedSeoPagesPhase4.ts",
  },
  {
    phase: "P1",
    lang: "pt-BR",
    route: "/guides/passo-a-passo",
    action: "optimize-existing",
    primary: "maquiagem passo a passo",
    keywords: [
      "maquiagem passo a passo",
      "ordem da maquiagem",
      "como se maquiar",
    ],
    intent: "beginner-process",
    job: "Own routine and order searches with practical workflow.",
    conversion: "Montar minha rotina",
    implementation: "src/i18n/localizedSeoPagesPhase4.ts",
  },
  {
    phase: "P1",
    lang: "pt-BR",
    route: "/scenarios/casamento-convidada",
    action: "optimize-existing",
    primary: "maquiagem para casamento convidada",
    keywords: ["maquiagem para casamento convidada"],
    intent: "wedding-scenario",
    job: "Improve existing guest page around the confirmed high-volume query.",
    conversion: "Testar look de casamento",
    implementation: "src/i18n/localizedSeoPagesPhase4.ts",
  },
  {
    phase: "P1",
    lang: "pt-BR",
    route: "/for/pele-morena",
    action: "create-page",
    primary: "maquiagem para pele morena",
    keywords: ["maquiagem para pele morena", "batom para pele morena"],
    intent: "skin-tone-solution",
    job: "Build a skin-tone color page with lipstick and try-on bridge.",
    conversion: "Ver cores para minha pele",
    implementation: "src/i18n/localizedSeoPagesPhase4.ts",
  },
  {
    phase: "P1",
    lang: "pt-BR",
    route: "/for/pele-madura",
    action: "optimize-existing",
    primary: "maquiagem para pele madura",
    keywords: ["maquiagem para pele madura"],
    intent: "skin-type-solution",
    job: "Make mature-skin makeup visual and previewable.",
    conversion: "Comparar acabamento",
    implementation: "src/i18n/localizedSeoPagesPhase4.ts",
  },
];

function ensureReportDir() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

function parseCsvLine(line) {
  const cells = [];
  let value = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(value);
      value = "";
    } else {
      value += char;
    }
  }
  cells.push(value);
  return cells;
}

function readCsv(file) {
  const content = fs.readFileSync(path.join(ROOT, file), "utf8").trim();
  const lines = content.split(/\r?\n/);
  const header = parseCsvLine(lines.shift() ?? "");
  return lines.map((line) =>
    Object.fromEntries(
      parseCsvLine(line).map((value, index) => [header[index], value]),
    ),
  );
}

function readKeywordList() {
  return fs
    .readFileSync(path.join(ROOT, "keyword-list-all.txt"), "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [lang, category, ...rest] = line.split("\t");
      return { lang, category, keyword: rest.join("\t") };
    })
    .filter((row) => TARGET_LANGS.includes(row.lang));
}

function normalizeKeyword(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[()@]/g, "")
    .replace(/\s+\/\s+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mapKey(lang, keyword) {
  return `${lang}:${normalizeKeyword(keyword)}`;
}

function readRawVolumeFiles() {
  const files = [
    {
      file: "seo-volume-aisa-all-keywords.json",
      locales: ["en", "de", "fr", "ko", "zh-TW", "es"],
    },
    { file: "seo-volume-aisa-ja-sanitized.json" },
    { file: "seo-volume-aisa-pt-BR-sanitized.json" },
  ];
  const items = [];
  for (const item of files) {
    const full = path.join(TMP_DIR, item.file);
    if (!fs.existsSync(full)) continue;
    const blocks = JSON.parse(fs.readFileSync(full, "utf8"));
    for (const block of blocks) {
      if (item.locales && !item.locales.includes(block.locale)) continue;
      const task = block.response?.tasks?.[0];
      if (task?.status_code !== 20000) continue;
      for (const result of task.result ?? []) {
        items.push({
          lang: block.locale,
          keyword: result.keyword,
          searchVolume: result.search_volume ?? null,
          competition: result.competition ?? "",
          competitionIndex: result.competition_index ?? null,
          cpc: result.cpc ?? null,
        });
      }
    }
  }
  return items;
}

function readSupplementalKd() {
  const result = new Map();
  if (!fs.existsSync(TMP_DIR)) return result;
  const files = fs
    .readdirSync(TMP_DIR)
    .filter(
      (file) =>
        file.startsWith("seo-kd-aisa-missing-high-volume-") &&
        file.endsWith(".json"),
    );
  if (fs.existsSync(path.join(TMP_DIR, "aisa-kd-smoke.json"))) {
    files.push("aisa-kd-smoke.json");
  }
  for (const file of files) {
    const blocks = JSON.parse(
      fs.readFileSync(path.join(TMP_DIR, file), "utf8"),
    );
    for (const block of blocks) {
      const task = block.response?.tasks?.[0];
      if (task?.status_code !== 20000) continue;
      for (const resultBlock of task.result ?? []) {
        for (const item of resultBlock.items ?? []) {
          result.set(
            mapKey(block.locale, item.keyword),
            item.keyword_difficulty ?? null,
          );
        }
      }
    }
  }
  return result;
}

function buildMetrics() {
  const keywords = readKeywordList();
  const kdRows = readCsv("keyword-kd-results.csv");
  const kdMap = new Map(
    kdRows.map((row) => [
      mapKey(row.language, row.keyword),
      row.kd_score === "" ? null : Number(row.kd_score),
    ]),
  );
  for (const [key, value] of readSupplementalKd()) kdMap.set(key, value);

  const volumeMap = new Map();
  for (const item of readRawVolumeFiles()) {
    volumeMap.set(mapKey(item.lang, item.keyword), item);
  }

  const metrics = new Map();
  for (const row of keywords) {
    const aliases = ALIASES[`${row.lang}:${row.keyword}`] ?? [row.keyword];
    const volumeItems = aliases
      .map((keyword) => volumeMap.get(mapKey(row.lang, keyword)))
      .filter(Boolean);
    const searchVolume =
      volumeItems.length === 0
        ? null
        : volumeItems.reduce((sum, item) => sum + (item.searchVolume ?? 0), 0);
    const bestVolumeItem = volumeItems
      .filter((item) => item.searchVolume !== null)
      .sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0))[0];
    const kd =
      kdMap.get(mapKey(row.lang, row.keyword)) ??
      aliases
        .map((keyword) => kdMap.get(mapKey(row.lang, keyword)))
        .find((value) => value !== undefined) ??
      null;
    metrics.set(mapKey(row.lang, row.keyword), {
      ...row,
      searchVolume,
      kd,
      cpc: bestVolumeItem?.cpc ?? null,
      competition: bestVolumeItem?.competition ?? "",
      competitionIndex: bestVolumeItem?.competitionIndex ?? null,
      demandStatus:
        searchVolume === null
          ? "no-volume-data"
          : searchVolume <= 0
            ? "no-demand"
            : "confirmed-demand",
    });
  }

  for (const item of readRawVolumeFiles()) {
    const key = mapKey(item.lang, item.keyword);
    if (metrics.has(key)) continue;
    metrics.set(key, {
      lang: item.lang,
      category: "variant",
      keyword: item.keyword,
      searchVolume: item.searchVolume,
      kd: kdMap.get(key) ?? null,
      cpc: item.cpc,
      competition: item.competition,
      competitionIndex: item.competitionIndex,
      demandStatus:
        item.searchVolume === null
          ? "no-volume-data"
          : item.searchVolume <= 0
            ? "no-demand"
            : "confirmed-demand",
    });
  }

  return metrics;
}

function metricFor(metrics, lang, keyword) {
  return (
    metrics.get(mapKey(lang, keyword)) ?? {
      lang,
      keyword,
      category: "unknown",
      searchVolume: null,
      kd: null,
      cpc: null,
      competition: "",
      competitionIndex: null,
      demandStatus: "no-volume-data",
    }
  );
}

function prefixedUrl(lang, route) {
  const prefix = LANG_TO_SLUG[lang];
  if (!prefix) return route;
  return route === "/" ? `/${prefix}` : `/${prefix}${route}`;
}

function clusterMetrics(metrics, cluster) {
  const rows = cluster.keywords.map((keyword) =>
    metricFor(metrics, cluster.lang, keyword),
  );
  const volume = rows.reduce((sum, row) => sum + (row.searchVolume ?? 0), 0);
  const knownKd = rows
    .map((row) => row.kd)
    .filter((value) => value !== null && value !== undefined);
  const maxKd = knownKd.length ? Math.max(...knownKd) : null;
  const primaryMetric = metricFor(metrics, cluster.lang, cluster.primary);
  const cpcMax = Math.max(
    0,
    ...rows.map((row) => row.cpc).filter((value) => value !== null),
  );
  const canStandalone =
    volume >= SEARCH_VOLUME_MIN_CLUSTER &&
    (primaryMetric.searchVolume ?? 0) >= SEARCH_VOLUME_MIN_STANDALONE &&
    (primaryMetric.kd === null ||
      primaryMetric.kd === undefined ||
      primaryMetric.kd <= KD_MAX_STANDALONE);
  return {
    rows,
    volume,
    maxKd,
    cpcMax,
    primaryVolume: primaryMetric.searchVolume,
    primaryKd: primaryMetric.kd,
    demandGate: canStandalone ? "standalone-ok" : "needs-review",
  };
}

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(file, rows) {
  const headers = Object.keys(rows[0] ?? {});
  const content = [
    headers.join(","),
    ...rows.map((row) => headers.map((key) => csvEscape(row[key])).join(",")),
  ].join("\n");
  fs.writeFileSync(path.join(ROOT, file), content + "\n", "utf8");
}

function writeVolumeResults(metrics) {
  const rows = [...metrics.values()]
    .filter((row) => TARGET_LANGS.includes(row.lang))
    .sort((a, b) => {
      if (a.lang !== b.lang) return a.lang.localeCompare(b.lang);
      return (b.searchVolume ?? -1) - (a.searchVolume ?? -1);
    })
    .map((row) => ({
      lang: row.lang,
      category: row.category,
      keyword: row.keyword,
      searchVolume: row.searchVolume,
      kd: row.kd,
      cpc: row.cpc,
      competition: row.competition,
      competitionIndex: row.competitionIndex,
      demandStatus: row.demandStatus,
    }));
  writeCsv(`reports/seo-volume-results-${REPORT_DATE}.csv`, rows);
  return rows;
}

function writeRolloutCsv(metrics) {
  const rows = ROLLOUT_CLUSTERS.map((cluster) => {
    const stats = clusterMetrics(metrics, cluster);
    return {
      phase: cluster.phase,
      lang: cluster.lang,
      url: prefixedUrl(cluster.lang, cluster.route),
      action: cluster.action,
      primaryKeyword: cluster.primary,
      clusterKeywords: cluster.keywords.join(" | "),
      clusterSearchVolume: stats.volume,
      primarySearchVolume: stats.primaryVolume,
      primaryKd: stats.primaryKd,
      maxKd: stats.maxKd,
      cpcMax: stats.cpcMax || "",
      demandGate: stats.demandGate,
      intent: cluster.intent,
      pageJob: cluster.job,
      conversion: cluster.conversion,
      implementation: cluster.implementation,
    };
  }).sort((a, b) => {
    const phase = a.phase.localeCompare(b.phase);
    if (phase !== 0) return phase;
    return b.clusterSearchVolume - a.clusterSearchVolume;
  });
  writeCsv(`reports/seo-url-rollout-plan-${REPORT_DATE}.csv`, rows);
  return rows;
}

function byLang(rows) {
  const result = new Map();
  for (const row of rows) {
    const list = result.get(row.lang) ?? [];
    list.push(row);
    result.set(row.lang, list);
  }
  return result;
}

function renderMarkdown(rolloutRows, volumeRows) {
  const confirmedVolumeRows = volumeRows.filter(
    (row) => row.demandStatus === "confirmed-demand" && row.searchVolume >= 100,
  );
  const confirmedByLang = byLang(confirmedVolumeRows);
  const rolloutByLang = byLang(rolloutRows);
  const totalRolloutVolume = rolloutRows.reduce(
    (sum, row) => sum + row.clusterSearchVolume,
    0,
  );

  const lines = [];
  lines.push(`# SEO 收入导向关键词落地规划 (${REPORT_DATE})`);
  lines.push("");
  lines.push("## 结论");
  lines.push("");
  lines.push(
    "- 这轮已经用 AIsa 补齐搜索量；原 `keyword-kd-results.csv` 的 609 条 `search_volume` 全为空，不能直接作为上线定稿。",
  );
  lines.push(
    "- 独立页门槛：主词月搜量 >=100，且同一页面 cluster >=300；主词 KD <=25 才进入 P0/P1，低量词只做模块。",
  );
  lines.push(
    "- $10K MRR 的第一性原理：若 ARPU $20，需要约 500 付费用户；冷 SEO visitor-to-paid 按 1%-2% 估算，需要 25K-50K/月高意图访问。",
  );
  lines.push(
    `- 本计划选出 ${rolloutRows.length} 个 URL 级 cluster，AIsa 确认的 cluster 月搜索量合计约 ${totalRolloutVolume.toLocaleString()}。这不是可保证流量，而是可争夺需求池。`,
  );
  lines.push("");
  lines.push("## 执行原则");
  lines.push("");
  lines.push(
    "1. 先优化已有页面，不为同一意图制造 doorway page；缺口明确时再新增页。",
  );
  lines.push(
    "2. 每页必须有：唯一 title/H1、首屏直接回答、步骤/矩阵/对比表、FAQ、自拍试妆 CTA、相关内链。",
  );
  lines.push(
    "3. 产品词、诊断词、人群词、场景词优先；纯产品榜单词进入模块或后续 affiliate，不作为本轮主线。",
  );
  lines.push(
    "4. 日语和巴葡是本轮最大机会市场；英文负责高转化基础页面；德法西韩繁中做精选页，不铺量。",
  );
  lines.push("");
  lines.push("## 各语言确认需求");
  lines.push("");
  lines.push(
    "| 语言 | 搜索量>=100 的词数 | 最高需求词 | 最高搜索量 | 本轮 URL cluster |",
  );
  lines.push("| --- | ---: | --- | ---: | ---: |");
  for (const lang of TARGET_LANGS) {
    const rows = confirmedByLang.get(lang) ?? [];
    const top = rows.sort((a, b) => b.searchVolume - a.searchVolume)[0];
    lines.push(
      `| ${lang} (${LANG_LABELS[lang]}) | ${rows.length} | ${top?.keyword ?? ""} | ${top?.searchVolume ?? 0} | ${(rolloutByLang.get(lang) ?? []).length} |`,
    );
  }
  lines.push("");
  lines.push("## URL 落地计划");
  lines.push("");
  for (const lang of TARGET_LANGS) {
    const rows = rolloutByLang.get(lang) ?? [];
    if (!rows.length) continue;
    lines.push(`### ${lang} (${LANG_LABELS[lang]})`);
    lines.push("");
    lines.push(
      "| 阶段 | URL | 动作 | 主词 | cluster 月搜量 | 主词 KD | 最高变体 KD | 页面任务 |",
    );
    lines.push("| --- | --- | --- | --- | ---: | ---: | ---: | --- |");
    for (const row of rows) {
      lines.push(
        `| ${row.phase} | ${row.url} | ${row.action} | ${row.primaryKeyword} | ${row.clusterSearchVolume} | ${row.primaryKd ?? ""} | ${row.maxKd ?? ""} | ${row.pageJob} |`,
      );
    }
    lines.push("");
  }
  lines.push("## 先做顺序");
  lines.push("");
  lines.push(
    "1. P0：日语 `パーソナルカラー診断`、`顔タイプ診断`、`メイク 順番`；巴葡 `maquiagem para formatura`、`colorimetria pessoal`；英文 `makeup for hooded eyes` 和 AI try-on 意图页。",
  );
  lines.push(
    "2. P1：英文 mature/olive/natural/order，巴葡 casamento/pele morena/pele madura，德语 reife Haut/色彩诊断，法语 natural/mariage/paupières，西语 natural/paso a paso。",
  );
  lines.push(
    "3. P2：产品榜单、低量场景、节日区域词只进模块，等 GSC 曝光或收入数据证明后再独立。",
  );
  lines.push("");
  lines.push("## 输出文件");
  lines.push("");
  lines.push(`- \`reports/seo-volume-results-${REPORT_DATE}.csv\``);
  lines.push(`- \`reports/seo-url-rollout-plan-${REPORT_DATE}.csv\``);
  lines.push(`- \`reports/seo-revenue-rollout-plan-${REPORT_DATE}.md\``);
  lines.push("");
  return lines.join("\n");
}

function main() {
  ensureReportDir();
  const metrics = buildMetrics();
  const volumeRows = writeVolumeResults(metrics);
  const rolloutRows = writeRolloutCsv(metrics);
  fs.writeFileSync(
    path.join(REPORT_DIR, `seo-revenue-rollout-plan-${REPORT_DATE}.md`),
    renderMarkdown(rolloutRows, volumeRows),
    "utf8",
  );
  console.log(
    JSON.stringify(
      {
        volumeRows: volumeRows.length,
        rolloutRows: rolloutRows.length,
        outputs: [
          `reports/seo-volume-results-${REPORT_DATE}.csv`,
          `reports/seo-url-rollout-plan-${REPORT_DATE}.csv`,
          `reports/seo-revenue-rollout-plan-${REPORT_DATE}.md`,
        ],
      },
      null,
      2,
    ),
  );
}

main();
