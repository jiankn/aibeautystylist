import { readFile } from "node:fs/promises";

const requiredKeys = [
  "APP_ENV",
  "APP_PUBLIC_URL",
  "AI_PROVIDER",
  "UPLOAD_PROVIDER",
  "GEMINI_API_KEY",
  "GEMINI_MODEL",
  "GEMINI_MODEL_FREE",
  "GEMINI_IMAGE_MODEL",
  "GEMINI_TIMEOUT_MS",
  "GEMINI_IMAGE_TIMEOUT_MS",
  "GEMINI_THINKING_LEVEL",
  "EVOLINK_API_KEY",
  "GOOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_OAUTH_CLIENT_SECRET",
  "POSTAL_API_URL",
  "POSTAL_API_KEY",
  "POSTAL_API_FROM_NAME",
  "SMTP_FROM",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_PRO_MONTHLY",
  "STRIPE_PRICE_PRO_YEARLY",
  "STRIPE_PRICE_PREMIUM_MONTHLY",
  "STRIPE_PRICE_PREMIUM_YEARLY",
  "STRIPE_PRICE_SINGLE_OCCASION",
];

const file = new URL("../.dev.vars", import.meta.url);
const content = await readFile(file, "utf8").catch(() => "");
const configuredKeys = new Set(
  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => line.slice(0, line.indexOf("=")).trim()),
);

const missing = requiredKeys.filter((key) => !configuredKeys.has(key));
const providerValues = new Map(
  content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const separator = line.indexOf("=");
      return [
        line.slice(0, separator).trim(),
        line.slice(separator + 1).trim(),
      ];
    }),
);
const invalidProviders = [
  ["AI_PROVIDER", ["mock", "gemini"]],
  ["UPLOAD_PROVIDER", ["mock", "r2"]],
  ["TRYON_PROVIDER", ["mock", "gemini"]],
  ["IMAGE_PROVIDER", ["gemini", "evolink"]],
].filter(
  ([key, allowed]) =>
    providerValues.has(key) && !allowed.includes(providerValues.get(key)),
);

if (missing.length > 0) {
  console.error(`缺少必需环境变量：${missing.join(", ")}`);
  process.exitCode = 1;
} else if (invalidProviders.length > 0) {
  console.error(
    `环境变量值无效：${invalidProviders.map(([key]) => key).join(", ")}`,
  );
  process.exitCode = 1;
} else {
  const tryOnProvider = providerValues.get("TRYON_PROVIDER") ?? "mock(default)";
  const imageProvider =
    providerValues.get("IMAGE_PROVIDER") ?? "gemini(default)";
  console.log(
    `环境变量检查通过，共确认 ${requiredKeys.length} 个必需配置项；AI=${providerValues.get("AI_PROVIDER")}，上传=${providerValues.get("UPLOAD_PROVIDER")}，任务=${tryOnProvider}，出图=${imageProvider}。`,
  );
}
