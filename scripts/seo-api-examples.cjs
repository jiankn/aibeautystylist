#!/usr/bin/env node

/**
 * DataForSEO and AIsa DataForSEO usage examples for SEO keyword validation.
 *
 * Default mode is a dry run: it prints the endpoint, auth type, and payload
 * without making a billable API call. Add --execute when credentials are set.
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");

const SEARCH_CONTEXTS = {
  en: {
    location_name: "United States",
    language_name: "English",
    defaults: [
      "AI makeup try-on",
      "what makeup suits me",
      "virtual makeup tester",
    ],
  },
  de: {
    location_name: "Germany",
    language_name: "German",
    defaults: [
      "KI Make-up Test",
      "welches Make-up passt zu mir",
      "virtuelles Make-up Testen",
    ],
  },
  fr: {
    location_name: "France",
    language_name: "French",
    defaults: [
      "test maquillage virtuel",
      "quel maquillage pour moi",
      "maquillage naturel",
    ],
  },
  ja: {
    location_name: "Japan",
    language_name: "Japanese",
    defaults: ["AIメイク診断", "似合うメイク", "パーソナルカラー診断"],
  },
  ko: {
    location_name: "South Korea",
    language_name: "Korean",
    defaults: [
      "AI 메이크업 진단",
      "나에게 어울리는 메이크업",
      "퍼스널컬러 진단",
    ],
  },
  "zh-TW": {
    location_name: "Taiwan",
    language_name: "Chinese (Traditional)",
    defaults: ["AI 妝容診斷", "什麼妝適合我", "虛擬試妝"],
  },
  es: {
    location_name: "Spain",
    language_name: "Spanish",
    defaults: [
      "prueba de maquillaje virtual",
      "qué maquillaje me queda",
      "maquillaje natural",
    ],
  },
  "pt-BR": {
    location_name: "Brazil",
    language_name: "Portuguese",
    defaults: [
      "teste de maquiagem virtual",
      "qual maquiagem combina comigo",
      "maquiagem natural",
    ],
  },
};

const PROJECT_SEO_RESEARCH_LOCALES = [
  "en",
  "de",
  "fr",
  "ja",
  "ko",
  "zh-TW",
  "es",
  "pt-BR",
];

const ACTIONS = new Set(["kd", "volume", "serp", "site-keywords"]);
const PROVIDERS = new Set(["dataforseo", "aisa"]);

function parseArgs(argv) {
  const parsed = {};
  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;
    const body = arg.slice(2);
    const separator = body.indexOf("=");
    if (separator === -1) {
      parsed[body] = true;
    } else {
      parsed[body.slice(0, separator)] = body.slice(separator + 1);
    }
  }
  return parsed;
}

function parseEnvFile(filePath, target) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;

    const separator = line.indexOf("=");
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    value = value.replace(/^['"]|['"]$/g, "");

    if (value) {
      target[key] = value;
    }
  }
}

function loadLocalEnv() {
  const localEnv = {};
  parseEnvFile(path.join(PROJECT_ROOT, ".dev.vars.sample"), localEnv);
  parseEnvFile(path.join(PROJECT_ROOT, ".dev.vars.example"), localEnv);
  parseEnvFile(path.join(PROJECT_ROOT, ".dev.vars"), localEnv);

  for (const [key, value] of Object.entries(localEnv)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function splitKeywords(value) {
  return value
    .split(/[\n,]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function splitLocales(value) {
  return value
    .split(",")
    .map((locale) => locale.trim())
    .filter(Boolean);
}

function readKeywordsFromFile(filePath, locale) {
  const resolved = path.isAbsolute(filePath)
    ? filePath
    : path.join(PROJECT_ROOT, filePath);
  const lines = fs.readFileSync(resolved, "utf8").split(/\r?\n/);
  const keywords = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const parts = line.split("\t").map((part) => part.trim());
    if (parts.length >= 3) {
      if (!locale || parts[0] === locale) {
        keywords.push(parts.slice(2).join(" "));
      }
    } else if (!line.includes("|")) {
      keywords.push(line);
    }
  }

  return keywords;
}

function unique(values) {
  return [...new Set(values)];
}

function resolveKeywords(args, locale, context) {
  let keywords;

  if (args.keywords) {
    keywords = splitKeywords(args.keywords);
  } else if (args.keyword) {
    keywords = [args.keyword.trim()];
  } else if (args["from-file"]) {
    keywords = readKeywordsFromFile(args["from-file"], locale);
  } else {
    keywords = context.defaults;
  }

  const limit = Number(args.limit || process.env.SEO_KEYWORD_LIMIT || 20);
  return unique(keywords).slice(0, limit);
}

function resolveContext(args, locale) {
  const context = SEARCH_CONTEXTS[locale];
  if (!context) {
    throw new Error(
      `Unsupported locale: ${locale}. Supported: ${Object.keys(SEARCH_CONTEXTS).join(", ")}`,
    );
  }

  return {
    location_name:
      args.location ||
      process.env.SEO_DEFAULT_LOCATION_NAME ||
      context.location_name,
    language_name:
      args.language ||
      process.env.SEO_DEFAULT_LANGUAGE_NAME ||
      context.language_name,
    defaults: context.defaults,
  };
}

function resolveLocales(args) {
  if (args["all-locales"]) {
    return splitLocales(
      args.locales ||
        process.env.SEO_RESEARCH_LOCALES ||
        PROJECT_SEO_RESEARCH_LOCALES.join(","),
    );
  }

  if (args.locales) {
    return splitLocales(args.locales);
  }

  return [args.locale || process.env.SEO_DEFAULT_LOCALE || "en"];
}

function endpointFor(provider, action) {
  const dataForSeoBase =
    process.env.DATAFORSEO_BASE_URL || "https://api.dataforseo.com/v3";
  const aisaBase = process.env.AISA_BASE_URL || "https://api.aisa.one/apis/v1";

  const dataForSeoPaths = {
    kd: "/dataforseo_labs/google/bulk_keyword_difficulty/live",
    volume: "/keywords_data/google_ads/search_volume/live",
    serp: "/serp/google/organic/live/regular",
    "site-keywords": "/keywords_data/google_ads/keywords_for_site/task_post",
  };

  const aisaPaths = {
    kd: "/dataforseo/dataforseo_labs/google/bulk_keyword_difficulty/live",
    volume: "/dataforseo/keywords_data/google_ads/search_volume/live",
    serp: "/dataforseo/serp/google/organic/live/regular",
    "site-keywords":
      "/dataforseo/keywords_data/google_ads/keywords_for_site/task_post",
  };

  const base = provider === "aisa" ? aisaBase : dataForSeoBase;
  const pathPart =
    provider === "aisa" ? aisaPaths[action] : dataForSeoPaths[action];
  return `${base.replace(/\/$/, "")}${pathPart}`;
}

function buildPayload(action, args, locale, context, keywords) {
  const tag =
    args.tag ||
    `aibeautystylist-${action}-${locale}-${new Date().toISOString().slice(0, 10)}`;

  if (action === "kd") {
    return {
      keywords,
      location_name: context.location_name,
      language_name: context.language_name,
      tag,
    };
  }

  if (action === "volume") {
    return {
      keywords,
      location_name: context.location_name,
      language_name: context.language_name,
      search_partners: false,
      tag,
    };
  }

  if (action === "serp") {
    return {
      keyword: args.keyword || keywords[0],
      location_name: context.location_name,
      language_name: context.language_name,
      device: args.device || "desktop",
      os: args.os || "windows",
      depth: Number(args.depth || 10),
      tag,
    };
  }

  if (action === "site-keywords") {
    return {
      target:
        args.target ||
        process.env.SEO_TARGET_DOMAIN ||
        process.env.SEO_SITE_DOMAIN ||
        "aibeautystylist.com",
      target_type: args["target-type"] || "site",
      location_name: context.location_name,
      language_name: context.language_name,
      include_adult_keywords: false,
      sort_by: args["sort-by"] || "search_volume",
      tag,
    };
  }

  throw new Error(`Unsupported action: ${action}`);
}

function requestBodyFor(payload) {
  return [payload];
}

function authHeadersFor(provider) {
  if (provider === "aisa") {
    const token = process.env.AISA_API_KEY || process.env.AISA_BEARER_TOKEN;
    if (!token) {
      throw new Error("Missing AISA_API_KEY in .dev.vars");
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  const login =
    process.env.DATAFORSEO_LOGIN || process.env.DATAFORSEO_API_LOGIN;
  const password =
    process.env.DATAFORSEO_PASSWORD ||
    process.env.DATAFORSEO_API_PASSWORD ||
    process.env.DATAFORSEO_API_KEY;

  if (!login || !password) {
    throw new Error(
      "Missing DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .dev.vars",
    );
  }

  return {
    Authorization: `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`,
    "Content-Type": "application/json",
  };
}

function redactedHeaders(provider) {
  return provider === "aisa"
    ? {
        Authorization: "Bearer <AISA_API_KEY>",
        "Content-Type": "application/json",
      }
    : {
        Authorization: "Basic base64(<DATAFORSEO_LOGIN>:<DATAFORSEO_PASSWORD>)",
        "Content-Type": "application/json",
      };
}

function flattenItems(response) {
  const tasks = Array.isArray(response?.tasks) ? response.tasks : [];
  const results = tasks.flatMap((task) =>
    Array.isArray(task?.result) ? task.result : [],
  );
  return results.flatMap((result) => {
    if (Array.isArray(result?.items)) return result.items;
    if (result && typeof result === "object" && "keyword" in result) {
      return [result];
    }
    return [];
  });
}

function summarize(action, response) {
  const items = flattenItems(response);
  const base = {
    status_code: response?.status_code,
    status_message: response?.status_message,
    cost: response?.cost,
    tasks_count: response?.tasks_count,
    tasks_error: response?.tasks_error,
    items_count: items.length,
  };

  if (action === "kd") {
    return {
      ...base,
      items: items.map((item) => ({
        keyword: item.keyword,
        keyword_difficulty: item.keyword_difficulty,
      })),
    };
  }

  if (action === "volume") {
    return {
      ...base,
      items: items.map((item) => ({
        keyword: item.keyword,
        search_volume: item.search_volume,
        competition: item.competition,
        competition_index: item.competition_index,
        cpc: item.cpc,
      })),
    };
  }

  if (action === "serp") {
    return {
      ...base,
      items: items.slice(0, 10).map((item) => ({
        rank_group: item.rank_group,
        type: item.type,
        domain: item.domain,
        title: item.title,
        url: item.url,
      })),
    };
  }

  return base;
}

async function executeRequest(endpoint, provider, body) {
  const headers = authHeadersFor(provider);
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.response = json;
    throw error;
  }

  return json;
}

async function main() {
  loadLocalEnv();

  const args = parseArgs(process.argv.slice(2));
  const provider = args.provider || "dataforseo";
  const action = args.action || "kd";

  if (!PROVIDERS.has(provider)) {
    throw new Error(`Unsupported provider: ${provider}`);
  }
  if (!ACTIONS.has(action)) {
    throw new Error(`Unsupported action: ${action}`);
  }

  const locales = resolveLocales(args);
  const requests = locales.map((locale) => {
    const context = resolveContext(args, locale);
    const keywords = resolveKeywords(args, locale, context);
    const payload = buildPayload(action, args, locale, context, keywords);
    return {
      locale,
      provider,
      action,
      endpoint: endpointFor(provider, action),
      headers: redactedHeaders(provider),
      body: requestBodyFor(payload),
    };
  });

  if (!args.execute) {
    console.log(
      JSON.stringify(
        {
          dry_run: true,
          note: "Add --execute to send the request.",
          provider,
          action,
          locale_count: requests.length,
          excluded_locales: ["zh-CN"],
          requests,
        },
        null,
        2,
      ),
    );
    return;
  }

  const results = [];
  const fullResponses = [];
  for (const request of requests) {
    const response = await executeRequest(
      request.endpoint,
      provider,
      request.body,
    );
    results.push({
      locale: request.locale,
      ...summarize(action, response),
    });
    fullResponses.push({
      locale: request.locale,
      response,
    });
  }

  console.log(JSON.stringify(results, null, 2));

  if (args.output) {
    const outputPath = path.isAbsolute(args.output)
      ? args.output
      : path.join(PROJECT_ROOT, args.output);
    fs.writeFileSync(outputPath, JSON.stringify(fullResponses, null, 2));
    console.log(`Full response written to ${outputPath}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  if (error.response) {
    console.error(JSON.stringify(error.response, null, 2));
  }
  process.exitCode = 1;
});
