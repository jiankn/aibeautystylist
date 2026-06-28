#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const REPORT_DIR = path.join(ROOT, "reports");
const REPORT_DATE = "2026-06-21";

const TARGET_LANGS = ["en", "de", "fr", "ja", "ko", "zh-TW", "es", "pt-BR"];
const SLUG_TO_LANG = {
  en: "en",
  de: "de",
  fr: "fr",
  ja: "ja",
  ko: "ko",
  "zh-tw": "zh-TW",
  es: "es",
  "pt-br": "pt-BR",
  "zh-cn": "zh-CN",
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
  "zh-CN": "简体中文",
};

const CATEGORY_ORDER = [
  "style",
  "scenario",
  "demographic",
  "tutorial",
  "ai_tech",
  "product",
  "trust",
  "regional",
];

const HIGH_INTENT_CATEGORIES = new Set([
  "ai_tech",
  "product",
  "scenario",
  "demographic",
  "tutorial",
]);

const CORE_LAUNCH_KEYWORDS = {
  en: [
    "AI makeup try-on",
    "what makeup suits me",
    "personal color analysis",
    "before and after makeup",
    "makeup tutorial for beginners",
  ],
  de: [
    "KI Make-up Test",
    "welches Make-up passt zu mir",
    "Farbsaison bestimmen",
    "Make-up Vorher-Nachher",
    "Make-up für Anfänger",
  ],
  fr: [
    "test maquillage virtuel",
    "quel maquillage pour moi",
    "diagnostic teint",
    "avant après maquillage",
    "maquillage pour débutantes",
  ],
  ja: [
    "AIメイク診断",
    "似合うメイク",
    "パーソナルカラー診断",
    "ビフォアアフターメイク",
    "メイク 初心者",
  ],
  ko: [
    "AI 메이크업 진단",
    "나에게 어울리는 메이크업",
    "퍼스널컬러 진단",
    "비포 애프터 메이크업",
    "메이크업 초보",
  ],
  "zh-TW": [
    "AI 妝容診斷",
    "什麼妝適合我",
    "個人色彩診斷",
    "妝前妝後對比",
    "新手化妝教學",
  ],
  es: [
    "prueba de maquillaje virtual",
    "qué maquillaje me queda",
    "análisis de color personal",
    "antes y después maquillaje",
    "maquillaje para principiantes",
  ],
  "pt-BR": [
    "teste de maquiagem virtual",
    "qual maquiagem combina comigo",
    "colorimetria pessoal",
    "antes e depois maquiagem",
    "maquiagem para iniciantes",
  ],
};

const LOCALIZATION_RULES = [
  {
    locale: "zh-CN",
    pattern: "从选妆到上脸，流程很短",
    priority: "P1",
    note: "大陆简中口语不自然，“流程很短”偏机器翻译。",
    suggestion: "选妆、上传、看试妆参考，三步完成",
  },
  {
    locale: "zh-CN",
    pattern: "真实上脸效果",
    priority: "P1",
    note: "AI 结果不能承诺“真实上脸”，应收敛为参考/预览。",
    suggestion: "AI 生成的试妆参考",
  },
  {
    locale: "zh-CN",
    pattern: "先保养还是先底妆",
    priority: "P2",
    note: "大陆语境更常说“护肤”，不是“保养”。",
    suggestion: "先护肤还是先底妆",
    sourceFiles: ["src/i18n/localizedSeoPages.ts"],
  },
  {
    locale: "ja",
    pattern:
      "通勤、デート、写真、イベント別に選び、自分の顔でAIプレビューを確認できます。",
    priority: "P1",
    note: "首页多处重复同一句，像模板填充，不像日语产品文案。",
    suggestion:
      "按模块重写：首屏讲“似合う方向”，场景区讲“予定別”，证明区讲“比較ポイント”。",
  },
  {
    locale: "ja",
    pattern: '"結果"',
    keyPrefix: "homepage.",
    exactValues: ["結果", "結果を比較", "AI 結果"],
    priority: "P1",
    note: "多个首页卡片只写“結果/シーン/カタログ”，信息过薄。",
    suggestion:
      "用具体日语短语，如“仕上がり比較”“予定別に選ぶ”“メイク候補を見る”。",
  },
  {
    locale: "ko",
    pattern:
      "출근, 데이트, 사진, 행사별 룩을 고르고 내 얼굴에서 AI 미리보기를 확인하세요.",
    priority: "P1",
    note: "韩文首页多处重复同一句，像英文模板直译后复用。",
    suggestion:
      "按模块重写：首屏讲“어울리는 방향”，场景区讲“상황별 선택”，证明区讲“비교 기준”。",
  },
  {
    locale: "ko",
    pattern: '"결과"',
    keyPrefix: "homepage.",
    exactValues: ["결과", "결과 비교", "AI 결과"],
    priority: "P1",
    note: "多个首页卡片只写“결과/상황/카탈로그”，过于泛。",
    suggestion: "用具体韩语短语，如“전후 비교”“상황별 룩”“룩 카탈로그”。",
  },
  {
    locale: "de",
    pattern: "AI Diagnose",
    priority: "P2",
    note: "德语页应优先用 KI，且避免像医疗诊断。",
    suggestion: "KI Make-up-Check / KI Make-up-Beratung",
  },
  {
    locale: "fr",
    pattern: "IA pratique",
    priority: "P3",
    note: "可读，但栏目名偏工具化；法语美妆内容可更自然。",
    suggestion: "Essai IA / Conseils IA",
  },
  {
    locale: "es",
    pattern: "precios de prueba de maquillaje IA",
    priority: "P2",
    note: "缺少“con IA”，西语 SEO 表达不够自然。",
    suggestion: "precios del probador de maquillaje con IA",
    sourceFiles: ["src/i18n/localizedSeoPagesPhase4.ts"],
  },
  {
    locale: "pt-BR",
    pattern: "preços de teste de maquiagem IA",
    priority: "P2",
    note: "巴葡更自然的结构是“com IA”。",
    suggestion: "preços do teste de maquiagem com IA",
    sourceFiles: ["src/i18n/localizedSeoPagesPhase4.ts"],
  },
];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function ensureReportDir() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

function parseCsvLine(line) {
  const cells = [];
  let value = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      i += 1;
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

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines.shift() ?? "");
  return lines.map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(
      header.map((key, index) => [key, cells[index] ?? ""]),
    );
  });
}

function normalizeKeyword(keyword) {
  return keyword.toLowerCase().normalize("NFKC").replace(/\s+/g, " ").trim();
}

function kdLevel(kd) {
  if (kd === null || kd === undefined || Number.isNaN(kd)) return "no_data";
  if (kd <= 10) return "very_low";
  if (kd <= 25) return "low";
  if (kd <= 50) return "medium";
  if (kd <= 75) return "high";
  return "very_high";
}

function categoryWeight(category) {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

function readKeywordList() {
  return read("keyword-list-all.txt")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [lang, category, ...rest] = line.split("\t");
      return {
        lang,
        category,
        keyword: rest.join("\t").trim(),
      };
    });
}

function readKdResults() {
  return parseCsv(read("keyword-kd-results.csv")).map((row) => ({
    lang: row.language,
    category: row.category,
    keyword: row.keyword,
    kd: row.kd_score === "" ? null : Number(row.kd_score),
    kdLevel:
      row.kd_level ||
      kdLevel(row.kd_score === "" ? null : Number(row.kd_score)),
    searchVolume: row.search_volume === "" ? null : Number(row.search_volume),
    error: row.error || "",
  }));
}

function statsByLanguage(records) {
  const stats = new Map();
  for (const record of records) {
    const item = stats.get(record.lang) ?? {
      total: 0,
      withKd: 0,
      noKd: 0,
      veryLow: 0,
      low: 0,
      medium: 0,
      high: 0,
      veryHigh: 0,
      byCategory: {},
    };
    item.total += 1;
    item.byCategory[record.category] =
      (item.byCategory[record.category] ?? 0) + 1;
    const level = kdLevel(record.kd);
    if (level === "no_data") item.noKd += 1;
    else item.withKd += 1;
    if (level === "very_low") item.veryLow += 1;
    if (level === "low") item.low += 1;
    if (level === "medium") item.medium += 1;
    if (level === "high") item.high += 1;
    if (level === "very_high") item.veryHigh += 1;
    stats.set(record.lang, item);
  }
  return stats;
}

function parseLocalizedPageSeeds(file) {
  const lines = read(file).split(/\r?\n/);
  const pages = [];
  let current = null;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const langMatch = line.match(/languageSlug:\s*"([^"]+)"/);
    if (langMatch) {
      current = {
        source: file,
        line: index + 1,
        languageSlug: langMatch[1],
      };
      continue;
    }
    if (!current) continue;
    for (const field of ["path", "englishPath", "category", "keyword"]) {
      if (current[field]) continue;
      const match = line.match(new RegExp(`${field}:\\s*"([^"]+)"`));
      if (match) current[field] = match[1];
    }
    if (
      current.path &&
      current.englishPath &&
      current.category &&
      current.keyword
    ) {
      pages.push({
        ...current,
        lang: SLUG_TO_LANG[current.languageSlug] ?? current.languageSlug,
      });
      current = null;
    }
  }
  return pages;
}

function parseFooterPages() {
  const file = "src/i18n/localizedFooterSeoPages.ts";
  const content = read(file);
  const targetBlock = content.match(
    /footerSeoTargets[\s\S]*?=\s*\[([\s\S]*?)\];/,
  );
  const targets = [];
  if (targetBlock) {
    const regex = /\{\s*englishPath:\s*"([^"]+)",\s*category:\s*"([^"]+)"/g;
    let match;
    while ((match = regex.exec(targetBlock[1]))) {
      targets.push({ englishPath: match[1], category: match[2] });
    }
  }

  const pages = [];
  for (const slug of Object.keys(SLUG_TO_LANG)) {
    const key = slug.includes("-") ? `"${slug}"` : slug;
    const regex = new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\n\\s*\\],?`);
    const block = content.match(regex);
    if (!block) continue;
    const tripleRegex = /\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g;
    let index = 0;
    let match;
    while ((match = tripleRegex.exec(block[1]))) {
      const target = targets[index] ?? { englishPath: "", category: "unknown" };
      pages.push({
        source: file,
        line: null,
        languageSlug: slug,
        lang: SLUG_TO_LANG[slug] ?? slug,
        path: match[1],
        keyword: match[2],
        secondaryKeyword: match[3],
        englishPath: target.englishPath,
        category: target.category,
      });
      index += 1;
    }
  }
  return pages;
}

function walkAstroFiles(dir) {
  const absoluteDir = path.join(ROOT, dir);
  if (!fs.existsSync(absoluteDir)) return [];
  const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const relative = path.join(dir, entry.name).replace(/\\/g, "/");
    if (entry.isDirectory()) return walkAstroFiles(relative);
    if (entry.isFile() && entry.name.endsWith(".astro")) return [relative];
    return [];
  });
}

function routeFromEnglishPage(file) {
  const route = file
    .replace(/^src\/pages/, "")
    .replace(/\/index\.astro$/, "")
    .replace(/\.astro$/, "");
  return route || "/";
}

function categoryFromEnglishPage(file) {
  if (file.includes("/looks/")) return "style";
  if (file.includes("/scenarios/")) return "scenario";
  if (file.includes("/for/")) return "demographic";
  if (file.includes("/guides/")) return "tutorial";
  if (
    /\/(ai-|virtual-|tryon-|personalized-makeup-recommendation|diagnosis)/.test(
      file,
    )
  ) {
    return "ai_tech";
  }
  if (file.includes("/pricing") || file.includes("/support")) return "trust";
  return "core";
}

function titleToKeyword(title, file) {
  const cleaned = title
    .replace(/\s*\|\s*AI Beauty Stylist\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return path.basename(file, ".astro").replace(/-/g, " ");
  const [keyword] = cleaned.split(/\s+[—-]\s+|:\s+/u);
  return (keyword || cleaned).trim();
}

function parseEnglishSeoPages() {
  const files = [
    "src/pages/index.astro",
    "src/pages/ai-makeup-try-on.astro",
    "src/pages/virtual-makeup-app.astro",
    "src/pages/virtual-makeup-tester.astro",
    "src/pages/tryon.astro",
    "src/pages/pricing.astro",
    "src/pages/ai-beauty-advisor.astro",
    "src/pages/personalized-makeup-recommendation.astro",
    ...walkAstroFiles("src/pages/looks"),
    ...walkAstroFiles("src/pages/scenarios"),
    ...walkAstroFiles("src/pages/for"),
    ...walkAstroFiles("src/pages/guides"),
  ];

  const seen = new Set();
  return files
    .filter((file) => {
      if (seen.has(file)) return false;
      seen.add(file);
      return fs.existsSync(path.join(ROOT, file));
    })
    .map((file) => {
      const content = read(file);
      const titleMatch = content.match(/title:\s*"([^"]+)"/);
      const fallbackKeyword =
        file === "src/pages/index.astro"
          ? "AI makeup try-on"
          : path.basename(file, ".astro").replace(/-/g, " ");
      const title = titleMatch?.[1] ?? fallbackKeyword;
      return {
        source: file,
        line: titleMatch ? findLine(content, title) : null,
        languageSlug: "en",
        lang: "en",
        path: routeFromEnglishPage(file),
        englishPath: routeFromEnglishPage(file),
        category: categoryFromEnglishPage(file),
        keyword: titleToKeyword(title, file),
      };
    });
}

function readImplementedPages() {
  const files = [
    "src/i18n/localizedSeoPages.ts",
    "src/i18n/localizedSeoPagesPhase3.ts",
    "src/i18n/localizedSeoPagesPhase4.ts",
  ];
  const englishPages = parseEnglishSeoPages();
  const seedPages = files.flatMap(parseLocalizedPageSeeds);
  const footerPages = parseFooterPages();
  const seen = new Set();
  return [...englishPages, ...seedPages, ...footerPages].filter((page) => {
    const key = `${page.lang}:${page.path}:${page.keyword}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function flattenJson(value, prefix = "") {
  if (typeof value === "string") {
    return [{ key: prefix, value }];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      flattenJson(item, `${prefix}[${index}]`),
    );
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      flattenJson(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [];
}

function findLine(content, value) {
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const lines = content.split(/\r?\n/);
  const index = lines.findIndex(
    (line) => line.includes(escaped) || line.includes(value),
  );
  return index === -1 ? null : index + 1;
}

function findJsonStringLine(content, keyPath, value) {
  const leafKey =
    keyPath
      .split(".")
      .pop()
      ?.replace(/\[\d+\]$/, "") ?? "";
  if (!leafKey) return findLine(content, value);

  const escapedKey = leafKey.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const escapedValue = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const lines = content.split(/\r?\n/);
  const index = lines.findIndex(
    (line) =>
      line.includes(`"${escapedKey}"`) &&
      (line.includes(escapedValue) || line.includes(value)),
  );
  return index === -1 ? findLine(content, value) : index + 1;
}

function readLocaleStrings() {
  const files = fs
    .readdirSync(path.join(ROOT, "src/locales"))
    .filter((file) => file.endsWith(".json"));
  const result = [];
  for (const file of files) {
    const locale = file.replace(/\.json$/, "");
    const content = read(`src/locales/${file}`);
    const parsed = JSON.parse(content);
    for (const item of flattenJson(parsed)) {
      result.push({
        locale,
        file: `src/locales/${file}`,
        line: findJsonStringLine(content, item.key, item.value),
        ...item,
      });
    }
  }
  return result;
}

function matchesLocalizationRule(rule, item) {
  if (rule.keyPrefix && !item.key.startsWith(rule.keyPrefix)) return false;
  if (rule.exactValues) return rule.exactValues.includes(item.value);
  return item.value.includes(rule.pattern.replace(/^"|"$/g, ""));
}

function localizationIssues(localeStrings) {
  const issues = [];
  for (const rule of LOCALIZATION_RULES) {
    for (const item of localeStrings) {
      if (item.locale !== rule.locale) continue;
      if (matchesLocalizationRule(rule, item)) {
        issues.push({
          ...rule,
          file: item.file,
          line: item.line,
          key: item.key,
          value: item.value,
        });
      }
    }
    if (rule.sourceFiles) {
      const needle = rule.pattern.replace(/^"|"$/g, "");
      for (const file of rule.sourceFiles) {
        const content = read(file);
        if (content.includes(needle)) {
          issues.push({
            ...rule,
            file,
            line: findLine(content, needle),
            key: "(source copy)",
            value: needle,
          });
        }
      }
    }
  }

  return issues;
}

function repeatedLocaleIssues(localeStrings) {
  const issues = [];
  for (const locale of ["ja", "ko"]) {
    const counts = new Map();
    for (const item of localeStrings.filter(
      (entry) => entry.locale === locale,
    )) {
      if (item.value.length < 28) continue;
      counts.set(item.value, (counts.get(item.value) ?? 0) + 1);
    }
    for (const [value, count] of counts) {
      if (count < 5) continue;
      issues.push({
        locale,
        priority: "P1",
        note: `同一句长文案重复 ${count} 次，说明该语言运行时页面仍有模板化填充。`,
        suggestion: "按模块和用户任务分别重写，不要复用同一句。",
        file: "src/locales/" + locale + ".json",
        line: null,
        key: "(repeated value)",
        value,
      });
    }
  }
  return issues;
}

function buildLocalizationIssues(localeStrings) {
  const issues = [
    ...localizationIssues(localeStrings),
    ...repeatedLocaleIssues(localeStrings),
  ];
  const seen = new Set();
  return issues.filter((issue) => {
    const key = [
      issue.locale,
      issue.file,
      issue.line ?? "",
      issue.key,
      issue.pattern ?? "",
      issue.value,
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function selectLaunchKeywords(kdRecords, implementedPages) {
  const implementedByLang = new Map();
  for (const page of implementedPages) {
    if (!TARGET_LANGS.includes(page.lang)) continue;
    const normalized = normalizeKeyword(page.keyword);
    const list = implementedByLang.get(page.lang) ?? new Set();
    list.add(normalized);
    implementedByLang.set(page.lang, list);
  }

  const kdByKey = new Map(
    kdRecords.map((record) => [
      `${record.lang}:${normalizeKeyword(record.keyword)}`,
      record,
    ]),
  );

  const rows = [];
  for (const lang of TARGET_LANGS) {
    const selected = new Set();
    const pushRow = (row) => {
      const key = normalizeKeyword(row.keyword);
      if (selected.has(key)) return;
      selected.add(key);
      rows.push(row);
    };
    const core = CORE_LAUNCH_KEYWORDS[lang] ?? [];
    for (const keyword of core) {
      const record = kdByKey.get(`${lang}:${normalizeKeyword(keyword)}`);
      pushRow({
        lang,
        tier: "core",
        keyword,
        category: record?.category ?? "core",
        kd: record?.kd ?? null,
        kdLevel: kdLevel(record?.kd ?? null),
        landing: "independent-page-or-existing-core",
        reason:
          "PRD/core matrix keyword; must be represented in title/H1/body or adjacent page.",
      });
    }

    const candidates = kdRecords
      .filter((record) => record.lang === lang)
      .filter((record) => record.kd !== null && record.kd <= 10)
      .filter((record) => HIGH_INTENT_CATEGORIES.has(record.category))
      .filter(
        (record) =>
          !selected.has(normalizeKeyword(record.keyword)) &&
          !(implementedByLang.get(lang) ?? new Set()).has(
            normalizeKeyword(record.keyword),
          ),
      )
      .sort((a, b) => {
        const byCategory =
          categoryWeight(a.category) - categoryWeight(b.category);
        if (byCategory !== 0) return byCategory;
        return (a.kd ?? 999) - (b.kd ?? 999);
      })
      .slice(0, 12);

    for (const record of candidates) {
      pushRow({
        lang,
        tier: "next-page",
        keyword: record.keyword,
        category: record.category,
        kd: record.kd,
        kdLevel: kdLevel(record.kd),
        landing: landingForCategory(record.category),
        reason:
          "Trusted CSV KD <= 10 and not exactly represented by current localized SEO page keyword.",
      });
    }

    const supportTerms = kdRecords
      .filter((record) => record.lang === lang)
      .filter((record) => record.kd === null)
      .filter((record) => HIGH_INTENT_CATEGORIES.has(record.category))
      .filter((record) => !selected.has(normalizeKeyword(record.keyword)))
      .filter(
        (record) =>
          !(implementedByLang.get(lang) ?? new Set()).has(
            normalizeKeyword(record.keyword),
          ),
      )
      .slice(0, 8);
    for (const record of supportTerms) {
      pushRow({
        lang,
        tier: "support-module",
        keyword: record.keyword,
        category: record.category,
        kd: null,
        kdLevel: "no_data",
        landing: "section-faq-related-link",
        reason:
          "No KD in trusted CSV; use inside stronger pages, not as standalone doorway pages.",
      });
    }
  }
  return rows;
}

function landingForCategory(category) {
  if (category === "ai_tech" || category === "product")
    return "product-or-tool-page";
  if (category === "style") return "style-landing-page";
  if (category === "scenario") return "scenario-landing-page";
  if (category === "demographic") return "feature-or-for-page";
  if (category === "tutorial") return "guide-or-blog-page";
  if (category === "trust") return "trust-faq-or-policy-support";
  if (category === "regional") return "regional-seasonal-guide";
  return "content-section";
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

function renderInventoryReport({
  keywordRecords,
  kdRecords,
  implementedPages,
  launchRows,
}) {
  const keywordStats = statsByLanguage(
    keywordRecords.map((record) => ({ ...record, kd: null })),
  );
  const kdStats = statsByLanguage(kdRecords);
  const implementedStats = new Map();
  for (const page of implementedPages) {
    const key = page.lang;
    const stats = implementedStats.get(key) ?? { total: 0, byCategory: {} };
    stats.total += 1;
    stats.byCategory[page.category] =
      (stats.byCategory[page.category] ?? 0) + 1;
    implementedStats.set(key, stats);
  }

  const lines = [];
  lines.push(`# SEO 关键词库存与落地规划 (${REPORT_DATE})`);
  lines.push("");
  lines.push("## 数据口径");
  lines.push("");
  lines.push(
    "- `keyword-kd-results.csv` 作为可信 KD 数据源；已有关键词不再调用 AIsa/DataForSEO 复查。",
  );
  lines.push(
    "- AIsa 只用于后续新增词、CSV 外词或缺失指标词的增量校验；DataForSEO 仅作为 AIsa 额度耗尽后的后备。",
  );
  lines.push(
    "- 简体中文不进入本轮 AIsa 多语言关键词研究，但纳入本地化质量审计。",
  );
  lines.push("");
  lines.push("## 各语言关键词统计");
  lines.push("");
  lines.push(
    "| 语言 | 关键词库总数 | KD 已有 | 无 KD | KD 0-10 | KD 11-25 | KD 26-50 | KD 51+ | 当前源码 SEO 关键词数 |",
  );
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const lang of TARGET_LANGS) {
    const kw = keywordStats.get(lang) ?? {};
    const kd = kdStats.get(lang) ?? {};
    const imp = implementedStats.get(lang) ?? {};
    lines.push(
      `| ${lang} (${LANG_LABELS[lang]}) | ${kw.total ?? 0} | ${kd.withKd ?? 0} | ${kd.noKd ?? 0} | ${kd.veryLow ?? 0} | ${kd.low ?? 0} | ${kd.medium ?? 0} | ${(kd.high ?? 0) + (kd.veryHigh ?? 0)} | ${imp.total ?? 0} |`,
    );
  }
  lines.push("");
  lines.push("## 实战落地规则");
  lines.push("");
  lines.push(
    "1. KD 0-10：优先做独立页，但必须满足单一搜索意图、独特 H1/meta/首屏回答、FAQ、内链和信息增益。",
  );
  lines.push(
    "2. KD 11-25：只给 AI 工具词、场景词、人群词、新手教程词做二线页；风格泛词先观察。",
  );
  lines.push(
    "3. 无 KD：不单独建页，放到已有强页面的 FAQ、步骤、对比表、相关链接里。",
  );
  lines.push(
    "4. KD 50+：新站不硬打；只作为正文语义覆盖或后续品牌/外链增强后的目标。",
  );
  lines.push(
    "5. 任何语言都不能只翻译英文页；标题和正文必须按当地搜索表达重写。",
  );
  lines.push("");
  lines.push("## 上线关键词分层");
  lines.push("");
  for (const lang of TARGET_LANGS) {
    lines.push(`### ${lang} (${LANG_LABELS[lang]})`);
    lines.push("");
    lines.push("| 层级 | 关键词 | 类别 | KD | 落地方式 |");
    lines.push("| --- | --- | --- | ---: | --- |");
    for (const row of launchRows
      .filter((item) => item.lang === lang)
      .slice(0, 25)) {
      lines.push(
        `| ${row.tier} | ${row.keyword} | ${row.category} | ${row.kd ?? ""} | ${row.landing} |`,
      );
    }
    lines.push("");
  }
  lines.push("## 页面规划重点");
  lines.push("");
  lines.push(
    "- 英文：保持产品词和场景词为主，`what makeup suits me`、`AI makeup try-on`、`makeup for hooded eyes` 是转化链核心。",
  );
  lines.push(
    "- 德语：隐私/可信表达很关键，`Make-up App Datenschutz` 等 trust 词不急于建页，但应进入 FAQ/隐私说明内链。",
  );
  lines.push("- 法语：避免硬卖，优先做自然妆、虚拟试妆、口红/肤色选择页。");
  lines.push(
    "- 日语：`似合うメイク`、`パーソナルカラー`、`垢抜け` 是主轴，页面需细致步骤和“自分に合う”判断逻辑。",
  );
  lines.push(
    "- 韩语：`퍼스널컬러`、`데일리 메이크업`、`쿨톤/웜톤 립` 是主轴，首页运行时文案需要先母语化。",
  );
  lines.push(
    "- 繁中：保留台湾常用词，`個人色彩`、`適合我的口紅`、`通勤妝`、`約會妝` 更适合转化。",
  );
  lines.push("- 西语：拉美/西班牙需分层，先做通用高意图词，区域词放内容模块。");
  lines.push(
    "- 巴葡：`maquiagem natural`、`pele glow`、`maquiagem para iniciantes`、`colorimetria pessoal` 值得优先扩页。",
  );
  lines.push("");
  return lines.join("\n");
}

function renderLocalizationReport(issues, localeStrings) {
  const lines = [];
  lines.push(`# 多语言本地化审计 (${REPORT_DATE})`);
  lines.push("");
  lines.push("## 结论");
  lines.push("");
  if (issues.length === 0) {
    lines.push(
      "- 当前未发现需要列为重点问题的本地化文案；本轮已修复简中、日语、韩语、德语、西语和巴葡的主要问题。",
    );
    lines.push(
      "- 仍建议把运行时文案重复风险表作为 P1/P2 后续重写依据，尤其是繁中、德语和法语的重复长句风险。",
    );
  } else {
    lines.push(
      "- 简体中文基础可用，但仍有产品口吻不自然和 AI 效果承诺过满的问题。",
    );
    lines.push(
      "- 日语、韩语运行时首页存在明显模板化复用，大量短标签和重复长句会影响转化与信任。",
    );
    lines.push(
      "- 德/法/西/巴葡 SEO 页面主体比运行时 locale 更好，但仍有少量术语需要本地化收敛。",
    );
  }
  lines.push("");
  lines.push("## 重点问题");
  lines.push("");
  lines.push(
    "| 优先级 | 语言 | 文件 | key/位置 | 当前文案 | 问题 | 建议方向 |",
  );
  lines.push("| --- | --- | --- | --- | --- | --- | --- |");
  for (const issue of issues) {
    lines.push(
      `| ${issue.priority} | ${issue.locale} | ${issue.file}${issue.line ? `:${issue.line}` : ""} | ${issue.key} | ${String(issue.value).replace(/\|/g, "\\|")} | ${issue.note} | ${issue.suggestion} |`,
    );
  }
  lines.push("");
  lines.push("## 运行时文案重复风险");
  lines.push("");
  lines.push("| 语言 | 字符串总数 | 重复长句数量 | 说明 |");
  lines.push("| --- | ---: | ---: | --- |");
  for (const locale of [
    "zh-CN",
    "zh-TW",
    "de",
    "fr",
    "ja",
    "ko",
    "es",
    "pt-BR",
  ]) {
    const items = localeStrings.filter((item) => item.locale === locale);
    const counts = new Map();
    for (const item of items) {
      if (item.value.length >= 28)
        counts.set(item.value, (counts.get(item.value) ?? 0) + 1);
    }
    const repeated = [...counts.values()].filter((count) => count >= 5).length;
    lines.push(
      `| ${locale} | ${items.length} | ${repeated} | ${repeated > 0 ? "需要逐模块重写，避免模板页感" : "未发现高频长句复用"} |`,
    );
  }
  lines.push("");
  lines.push("## 修订顺序");
  lines.push("");
  if (issues.length === 0) {
    lines.push(
      "1. P1：继续处理繁中、德语、法语运行时重复长句风险，按模块重写而不是逐词替换。",
    );
    lines.push(
      "2. P1：按 URL rollout 表继续落地剩余 P1 SEO 页面，并逐页复查 title、H1、FAQ 和 CTA。",
    );
    lines.push(
      "3. P2：上线后用 GSC query、CTR 和转化数据决定是否继续扩写低量词页面。",
    );
  } else {
    lines.push(
      "1. P1：先修简中首页 `howTitle`、`真实上脸效果`，以及日/韩首页重复模板句。",
    );
    lines.push(
      "2. P1：日/韩首页卡片、proof、scenario 模块用当地表达重写，不只替换几个词。",
    );
    lines.push("3. P2：德语统一 KI 术语，避免 Diagnose 像医疗判断。");
    lines.push("4. P2：西语/巴葡价格与 IA/IA wording 调整为自然语序。");
    lines.push("5. P3：法语栏目名和 CTA 细化为更审美化表达。");
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  ensureReportDir();
  const keywordRecords = readKeywordList().filter((record) =>
    TARGET_LANGS.includes(record.lang),
  );
  const kdRecords = readKdResults().filter((record) =>
    TARGET_LANGS.includes(record.lang),
  );
  const implementedPages = readImplementedPages();
  const localeStrings = readLocaleStrings();
  const issues = buildLocalizationIssues(localeStrings);
  const launchRows = selectLaunchKeywords(kdRecords, implementedPages);

  const launchCsv = `reports/seo-launch-keywords-${REPORT_DATE}.csv`;
  writeCsv(launchCsv, launchRows);

  const candidateRows = launchRows
    .filter((row) => row.tier === "core" || row.tier === "next-page")
    .map((row) => `${row.lang}\t${row.category}\t${row.keyword}`)
    .join("\n");
  fs.writeFileSync(
    path.join(REPORT_DIR, `seo-launch-candidates-${REPORT_DATE}.tsv`),
    candidateRows + "\n",
    "utf8",
  );

  fs.writeFileSync(
    path.join(REPORT_DIR, `seo-keyword-inventory-${REPORT_DATE}.md`),
    renderInventoryReport({
      keywordRecords,
      kdRecords,
      implementedPages,
      launchRows,
    }),
    "utf8",
  );

  fs.writeFileSync(
    path.join(REPORT_DIR, `localization-audit-${REPORT_DATE}.md`),
    renderLocalizationReport(issues, localeStrings),
    "utf8",
  );

  console.log(
    JSON.stringify(
      {
        keywordRecords: keywordRecords.length,
        kdRecords: kdRecords.length,
        implementedLocalizedKeywords: implementedPages.length,
        localizationIssues: issues.length,
        outputs: [
          launchCsv,
          `reports/seo-launch-candidates-${REPORT_DATE}.tsv`,
          `reports/seo-keyword-inventory-${REPORT_DATE}.md`,
          `reports/localization-audit-${REPORT_DATE}.md`,
        ],
      },
      null,
      2,
    ),
  );
}

main();
