/**
 * Cloudflare 部署 post-build 脚本。
 *
 * 问题：@cloudflare/vite-plugin 在构建阶段会尝试解析 wrangler.jsonc 中的 main 字段，
 * 但 dist/_worker.js 要等 astro build 完成后才存在，导致构建失败。
 *
 * 解决：wrangler.jsonc 中不设 main，构建完成后由本脚本生成一份带 main 的 wrangler.json，
 * wrangler deploy 优先读取 wrangler.json（比 .jsonc 优先级更高）。
 */
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync("wrangler.jsonc", "utf8");

// 去除单行注释（// ...），保留字符串内的双斜线
const stripped = src.replace(
  /("(?:[^"\\]|\\.)*")|\/\/.*$/gm,
  (match, str) => str || "",
);

// 去除尾逗号以兼容 strict JSON
const cleaned = stripped.replace(/,\s*([\]}])/g, "$1");

const config = JSON.parse(cleaned);
config.main = "dist/_worker.js";

writeFileSync("wrangler.json", JSON.stringify(config, null, 2));
console.log("✅ wrangler.json generated with main: dist/_worker.js");
