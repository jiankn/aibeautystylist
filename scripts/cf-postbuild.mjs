/**
 * Cloudflare 部署 post-build 脚本。
 *
 * astro build 完成后，直接在 wrangler.jsonc 中注入 "main" 字段，
 * 确保 Cloudflare 的 deploy 步骤能找到 Worker 入口。
 * （此修改仅发生在构建服务器上，不会影响 Git 仓库。）
 */
import { readFileSync, writeFileSync } from "node:fs";

const configPath = "wrangler.jsonc";
const src = readFileSync(configPath, "utf8");

if (src.includes('"main"')) {
  console.log("ℹ️  wrangler.jsonc already contains a main field, skipping.");
  process.exit(0);
}

// 在 "name": "..." 行后面插入 "main" 字段
const modified = src.replace(
  /("name":\s*"[^"]+",?)/,
  '$1\n  "main": "dist/_worker.js",',
);

if (modified === src) {
  console.error("❌ Failed to inject main into wrangler.jsonc — name field not found.");
  process.exit(1);
}

writeFileSync(configPath, modified);
console.log("✅ Injected main: dist/_worker.js into wrangler.jsonc");
