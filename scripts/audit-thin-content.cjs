#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

function readArg(name, fallback) {
  const exact = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (exact) return exact.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

const baseUrl = readArg(
  "--base",
  process.env.SEO_AUDIT_BASE_URL || "http://127.0.0.1:4321",
);
const csvPath = path.resolve(
  root,
  readArg("--csv", "reports/seo-url-rollout-plan-2026-06-21.csv"),
);
const reportPath = path.resolve(
  root,
  readArg("--report", "reports/thin-content-audit-2026-06-21.md"),
);
const jsonPath = path.resolve(
  root,
  readArg("--json", "reports/thin-content-audit-2026-06-21.json"),
);
const shouldWriteReport = process.argv.includes("--write-report");
const shouldWriteJson = process.argv.includes("--write-json");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...records] = rows.filter((item) => item.length > 1);
  return records.map((record) =>
    Object.fromEntries(
      headers.map((header, index) => [header, record[index] ?? ""]),
    ),
  );
}

function stripHtml(html) {
  const body = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html)?.[1] ?? html;
  return body
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
    .replace(/<header\b[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, " ")
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16)),
    );
}

function normalizeText(text) {
  return decodeEntities(text).normalize("NFKC").replace(/\s+/g, " ").trim();
}

function effectiveWordCount(text) {
  const normalized = normalizeText(text);
  const latinWords =
    normalized.match(
      /[\p{Script=Latin}\p{Script=Hangul}\d][\p{Script=Latin}\p{Script=Hangul}\p{Mark}\d'’-]*/gu,
    ) ?? [];
  const cjkChars =
    normalized.match(
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu,
    ) ?? [];
  return Math.round(latinWords.length + cjkChars.length / 2);
}

function extractAll(pattern, text) {
  return [...text.matchAll(pattern)].map((match) =>
    normalizeText(stripHtml(match[1] ?? "")),
  );
}

function normalizeKeyword(keyword) {
  return normalizeText(keyword).toLocaleLowerCase();
}

function includesKeyword(text, keyword) {
  const normalizedText = normalizeText(text).toLocaleLowerCase();
  const normalizedKeyword = normalizeKeyword(keyword);
  if (!normalizedKeyword) return true;
  return normalizedText.includes(normalizedKeyword);
}

function makeShingles(text, size = 5) {
  const normalized = normalizeText(text).toLocaleLowerCase();
  const tokens = normalized.match(/[\p{Letter}\p{Number}]+/gu) ?? [];
  const shingles = new Set();
  for (let index = 0; index <= tokens.length - size; index += 1) {
    shingles.add(tokens.slice(index, index + size).join(" "));
  }
  return shingles;
}

function jaccard(left, right) {
  if (left.size === 0 || right.size === 0) return 0;
  let intersection = 0;
  for (const item of left) {
    if (right.has(item)) intersection += 1;
  }
  return intersection / (left.size + right.size - intersection);
}

function analyzeHtml(row, html, status) {
  const title = normalizeText(
    /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "",
  );
  const h1 = extractAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, html);
  const h2 = extractAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, html);
  const mainText = normalizeText(stripHtml(html));
  const firstViewport = mainText.slice(0, 900);
  const internalLinks = new Set(
    [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)]
      .map((match) => match[1])
      .filter((href) => href.startsWith("/") && !href.startsWith("//")),
  );
  const hasFaq =
    /FAQPage|faq|常見問題|よくある質問|자주 묻는 질문|Preguntas frecuentes|Perguntas frequentes|Questions fréquentes|Häufige Fragen/i.test(
      html,
    );
  const hasCta =
    /try|upload|preview|diagnosis|probar|teste|essai|ausprobieren|試|診断|預覽|試妝|체험|미리보기/i.test(
      mainText,
    );
  const keyword = row.primaryKeyword;
  const keywordPlacement = {
    title: includesKeyword(title, keyword),
    h1: h1.some((value) => includesKeyword(value, keyword)),
    firstViewport: includesKeyword(firstViewport, keyword),
    body: includesKeyword(mainText, keyword),
  };
  const effectiveWords = effectiveWordCount(mainText);
  const reasons = [];
  const action = row.action;
  const moduleOnly = action === "module-only";

  if (status < 200 || status >= 300) reasons.push(`status ${status}`);
  if (effectiveWords < 450)
    reasons.push(`thin body: ~${effectiveWords} effective words`);
  if (h2.length < 3) reasons.push(`low section count: ${h2.length} h2`);
  if (!hasFaq) reasons.push("FAQ signal missing");
  if (internalLinks.size < 4)
    reasons.push(`low internal links: ${internalLinks.size}`);
  if (!hasCta) reasons.push("CTA signal missing");
  if (!keywordPlacement.body) {
    reasons.push("primary keyword missing from body");
  } else if (
    !moduleOnly &&
    !(
      keywordPlacement.title &&
      keywordPlacement.h1 &&
      keywordPlacement.firstViewport
    )
  ) {
    reasons.push(
      "primary keyword not fully present in title/H1/first viewport",
    );
  }

  const watchReasons = [];
  if (effectiveWords >= 450 && effectiveWords < 720) {
    watchReasons.push(`borderline body: ~${effectiveWords} effective words`);
  }
  if (moduleOnly && keywordPlacement.body && !keywordPlacement.firstViewport) {
    watchReasons.push(
      "module keyword present, but not a first-viewport term by design",
    );
  }

  return {
    phase: row.phase,
    lang: row.lang,
    url: row.url,
    action: row.action,
    keyword,
    status,
    effectiveWords,
    h1,
    h2Count: h2.length,
    hasFaq,
    hasCta,
    internalLinks: internalLinks.size,
    keywordPlacement,
    reasons,
    watchReasons,
    text: mainText,
    shingles: makeShingles(mainText),
  };
}

function severityFor(item) {
  if (item.reasons.length > 0) return "thin-risk";
  if (item.watchReasons.length > 0 || item.maxSimilarity >= 0.78)
    return "watch";
  return "ok";
}

function escapeCell(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function formatMarkdown(results, summary) {
  const watch = results.filter((item) => item.severity === "watch");
  const thin = results.filter((item) => item.severity === "thin-risk");
  const lines = [
    "# Thin Content Audit 2026-06-21",
    "",
    "Scope: 42 URL rows from `reports/seo-url-rollout-plan-2026-06-21.csv`.",
    "",
    `Method: final rendered HTML from local dev server \`${baseUrl}\`. Checked status, effective content volume, H2 section count, FAQ/schema signal, CTA/internal links, keyword placement, and max pairwise text similarity.`,
    "",
    "## Summary",
    "",
    `- Severe thin/doorway risk: ${summary.thinRisk}`,
    `- Watch items: ${summary.watch}`,
    `- Passed without thin-content signals: ${summary.ok}`,
    `- Highest pairwise similarity: ${summary.maxSimilarity.toFixed(2)}`,
    "",
  ];

  if (thin.length > 0) {
    lines.push("## Thin-Risk Items", "");
    lines.push("| URL | Keyword | Evidence |");
    lines.push("| --- | --- | --- |");
    for (const item of thin) {
      lines.push(
        `| \`${escapeCell(item.url)}\` | \`${escapeCell(item.keyword)}\` | ${escapeCell(item.reasons.join("; "))} |`,
      );
    }
    lines.push("");
  }

  if (watch.length > 0) {
    lines.push("## Watch List", "");
    lines.push("| URL | Keyword | Signal | Evidence |");
    lines.push("| --- | --- | --- | --- |");
    for (const item of watch) {
      const signals = [
        ...item.watchReasons,
        item.maxSimilarity >= 0.78
          ? `high similarity: ${item.maxSimilarity.toFixed(2)} with ${item.maxSimilarityUrl}`
          : "",
      ].filter(Boolean);
      lines.push(
        `| \`${escapeCell(item.url)}\` | \`${escapeCell(item.keyword)}\` | Watch | ${escapeCell(signals.join("; "))} |`,
      );
    }
    lines.push("");
  }

  lines.push(
    "## Interpretation",
    "",
    summary.thinRisk === 0
      ? "No target URL currently shows severe thin-content or doorway-page signals under the local rendered-HTML audit."
      : "Some target URLs still need consolidation or substantial content improvement before they should be treated as launch-ready.",
    "",
    summary.watch === 0
      ? "All target URLs now clear the configured body-depth, structure, CTA, FAQ, internal-link, keyword, and similarity checks."
      : "Watch items are not hard blockers, but they should be monitored after launch and improved before adding more same-template pages.",
    "",
    "## Operational Note",
    "",
    "This audit cannot guarantee Google indexing. It verifies the controllable page-quality surface before Google Search Console submission.",
    "",
  );

  return `${lines.join("\n")}\n`;
}

async function main() {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Missing CSV: ${csvPath}`);
  }

  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  const results = [];

  for (const row of rows) {
    const targetUrl = new URL(row.url, baseUrl).toString();
    const response = await fetch(targetUrl, {
      headers: {
        "user-agent": "AIBeautyStylistThinContentAudit/1.0",
      },
    });
    const html = await response.text();
    results.push(analyzeHtml(row, html, response.status));
  }

  for (const item of results) {
    let maxSimilarity = 0;
    let maxSimilarityUrl = "";
    for (const other of results) {
      if (other === item) continue;
      const similarity = jaccard(item.shingles, other.shingles);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        maxSimilarityUrl = other.url;
      }
    }
    item.maxSimilarity = maxSimilarity;
    item.maxSimilarityUrl = maxSimilarityUrl;
    item.severity = severityFor(item);
  }

  for (const item of results) {
    delete item.text;
    delete item.shingles;
  }

  const summary = {
    total: results.length,
    thinRisk: results.filter((item) => item.severity === "thin-risk").length,
    watch: results.filter((item) => item.severity === "watch").length,
    ok: results.filter((item) => item.severity === "ok").length,
    maxSimilarity: Math.max(0, ...results.map((item) => item.maxSimilarity)),
  };

  if (shouldWriteJson) {
    fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
    fs.writeFileSync(
      jsonPath,
      `${JSON.stringify({ summary, results }, null, 2)}\n`,
    );
  }

  if (shouldWriteReport) {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, formatMarkdown(results, summary));
  }

  console.log(JSON.stringify(summary, null, 2));

  if (summary.thinRisk > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
