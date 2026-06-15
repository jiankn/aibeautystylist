import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const appRoot = fileURLToPath(new URL("./app/", import.meta.url));

export default defineConfig({
  adapter: cloudflare({
    configPath: "../wrangler.jsonc",
  }),
  i18n: {
    defaultLocale: "en",
    locales: [
      "en",
      { path: "zh-cn", codes: ["zh-CN"] },
      { path: "de", codes: ["de-DE", "de"] },
      { path: "fr", codes: ["fr-FR", "fr"] },
      { path: "ja", codes: ["ja-JP", "ja"] },
      { path: "ko", codes: ["ko-KR", "ko"] },
      { path: "zh-tw", codes: ["zh-TW", "zh-Hant"] },
      { path: "es", codes: ["es-ES", "es"] },
      { path: "pt-br", codes: ["pt-BR", "pt"] },
    ],
    routing: "manual",
  },
  root: appRoot,
  srcDir: fileURLToPath(new URL("./src/", import.meta.url)),
  publicDir: fileURLToPath(new URL("./public/", import.meta.url)),
  outDir: fileURLToPath(new URL("./dist/", import.meta.url)),
  cacheDir: fileURLToPath(new URL("./node_modules/.astro/", import.meta.url)),
  output: "server",
  site: "https://aibeautystylist.com",
  trailingSlash: "ignore",
  vite: {
    cacheDir: fileURLToPath(new URL("./node_modules/.vite/", import.meta.url)),
    server: {
      fs: {
        allow: [projectRoot],
      },
    },
  },
});
