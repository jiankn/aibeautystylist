#!/usr/bin/env node

import { access } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = (process.env.AUDIT_BASE_URL ?? "http://127.0.0.1:4321").replace(
  /\/+$/,
  "",
);
const footerTargetCount = 14;
const locales = [
  { slug: "", lang: "en", eastAsia: false, minContentLength: 1800 },
  { slug: "zh-cn", lang: "zh-CN", eastAsia: true, minContentLength: 700 },
  { slug: "de", lang: "de-DE", eastAsia: false, minContentLength: 1900 },
  { slug: "fr", lang: "fr-FR", eastAsia: false, minContentLength: 1900 },
  { slug: "ja", lang: "ja-JP", eastAsia: true, minContentLength: 700 },
  { slug: "ko", lang: "ko-KR", eastAsia: true, minContentLength: 900 },
  { slug: "zh-tw", lang: "zh-TW", eastAsia: true, minContentLength: 550 },
  { slug: "es", lang: "es-ES", eastAsia: false, minContentLength: 1900 },
  { slug: "pt-br", lang: "pt-BR", eastAsia: false, minContentLength: 1900 },
];
const expectedHreflangs = new Set([
  "en",
  "zh-Hans",
  "de",
  "fr",
  "ja",
  "ko",
  "zh-Hant",
  "es",
  "pt-BR",
  "x-default",
]);
const browserCandidates = [
  process.env.EDGE_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].filter(Boolean);

let executablePath;
for (const candidate of browserCandidates) {
  if (
    await access(candidate)
      .then(() => true)
      .catch(() => false)
  ) {
    executablePath = candidate;
    break;
  }
}
if (!executablePath) throw new Error("未找到可用于 footer SEO 审计的浏览器。");

function normalizePath(value) {
  const url = new URL(value, baseUrl);
  let pathname = url.pathname;
  try {
    pathname = decodeURI(pathname);
  } catch {
    // Keep encoded path when decoding fails.
  }
  return pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;
}

function trigrams(value) {
  const normalized = value.toLowerCase().replace(/\s+/g, "");
  const result = new Set();
  for (let index = 0; index <= normalized.length - 3; index += 1) {
    result.add(normalized.slice(index, index + 3));
  }
  return result;
}

function similarity(left, right) {
  const a = trigrams(left);
  const b = trigrams(right);
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection += 1;
  return intersection / (a.size + b.size - intersection || 1);
}

const failures = [];
let pagesChecked = 0;
const browser = await chromium.launch({ executablePath, headless: true });

try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  const localHostname = new URL(baseUrl).hostname;
  await page.context().route("**/*", (route) => {
    const requestUrl = new URL(route.request().url());
    return requestUrl.protocol.startsWith("http") &&
      requestUrl.hostname !== localHostname
      ? route.abort()
      : route.continue();
  });

  for (const locale of locales) {
    const localeBodies = [];
    const homePath = locale.slug ? `/${locale.slug}` : "/";
    const response = await page.goto(`${baseUrl}${homePath}`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    if (!response?.ok()) {
      failures.push(
        `${homePath}: footer 首页 HTTP ${response?.status() ?? "无响应"}`,
      );
      continue;
    }

    const targetLinks = await page.evaluate(() => {
      const columns = [...document.querySelectorAll(".footer-column")].slice(
        0,
        3,
      );
      return [
        ...new Set(
          columns.flatMap((column, index) => {
            const links = [...column.querySelectorAll("a")];
            return links
              .slice(index === 0 ? 4 : 0)
              .map((link) => link.getAttribute("href") || "");
          }),
        ),
      ];
    });

    if (targetLinks.length !== footerTargetCount) {
      failures.push(
        `${homePath}: footer 目标链接 ${targetLinks.length}，期望 ${footerTargetCount}`,
      );
    }

    for (const href of targetLinks) {
      const expectedPrefix = locale.slug ? `/${locale.slug}/` : "/";
      if (locale.slug && !href.startsWith(expectedPrefix)) {
        failures.push(`${homePath}: footer 链接回退到非本地化路径 ${href}`);
      }

      const targetResponse = await page.goto(`${baseUrl}${href}`, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      pagesChecked += 1;
      if (!targetResponse?.ok()) {
        failures.push(`${href}: HTTP ${targetResponse?.status() ?? "无响应"}`);
        continue;
      }

      const result = await page.evaluate(() => {
        const h1 = document.querySelector("h1")?.textContent?.trim() ?? "";
        const title = document.title;
        const description =
          document
            .querySelector('meta[name="description"]')
            ?.getAttribute("content") ?? "";
        const canonical =
          document
            .querySelector('link[rel="canonical"]')
            ?.getAttribute("href") ?? "";
        const hreflangs = [
          ...document.querySelectorAll('link[rel="alternate"][hreflang]'),
        ].map((link) => link.getAttribute("hreflang") ?? "");
        const heroImage =
          document.querySelector(".seo-hero-image img")?.getAttribute("src") ??
          "";
        const ogImage =
          document
            .querySelector('meta[property="og:image"]')
            ?.getAttribute("content") ?? "";
        document.documentElement.setAttribute("data-theme", "dark");
        const parseColor = (value) => {
          const match = value.match(/rgba?\(([^)]+)\)/);
          if (!match) return null;
          const parts = match[1]
            .replace(/\//g, " ")
            .split(/[,\s]+/)
            .filter(Boolean);
          const channel = (part) =>
            part.endsWith("%")
              ? (Number.parseFloat(part) / 100) * 255
              : Number.parseFloat(part);
          return {
            r: channel(parts[0] ?? "0"),
            g: channel(parts[1] ?? "0"),
            b: channel(parts[2] ?? "0"),
            a: parts[3] === undefined ? 1 : Number.parseFloat(parts[3]),
          };
        };
        const luminance = ({ r, g, b }) => {
          const convert = (channel) => {
            const value = channel / 255;
            return value <= 0.03928
              ? value / 12.92
              : ((value + 0.055) / 1.055) ** 2.4;
          };
          return (
            0.2126 * convert(r) + 0.7152 * convert(g) + 0.0722 * convert(b)
          );
        };
        const contrast = (foreground, background) => {
          const lighter = Math.max(
            luminance(foreground),
            luminance(background),
          );
          const darker = Math.min(luminance(foreground), luminance(background));
          return (lighter + 0.05) / (darker + 0.05);
        };
        const effectiveBackground = (element) => {
          for (
            let current = element;
            current;
            current = current.parentElement
          ) {
            const color = parseColor(getComputedStyle(current).backgroundColor);
            if (color && color.a > 0.01) return color;
          }
          return (
            parseColor(getComputedStyle(document.body).backgroundColor) ?? {
              r: 15,
              g: 21,
              b: 32,
              a: 1,
            }
          );
        };
        const contrastSelectors = [
          ["SEO H2", ".seo-content h2"],
          ["SEO H3", ".seo-content h3"],
          ["SEO paragraph", ".seo-content p"],
          ["SEO list", ".seo-content li"],
          ["step title", ".step-card h4"],
          ["step body", ".step-card p"],
          ["feature title", ".feature-card h4"],
          ["feature body", ".feature-card p"],
          ["visual caption", ".visual-guide-item figcaption"],
          ["table header", ".compare-table th"],
          ["table cell", ".compare-table td"],
          ["highlight text", ".highlight-box p"],
          ["FAQ summary", ".faq-item summary"],
          ["FAQ body", ".faq-item p"],
          ["related heading", ".seo-related h3"],
          ["related link", ".related-list a"],
        ];
        const darkContrastFailures = contrastSelectors.flatMap(
          ([label, selector]) =>
            [...document.querySelectorAll(selector)]
              .slice(0, 3)
              .flatMap((element) => {
                const rect = element.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return [];
                const foreground = parseColor(getComputedStyle(element).color);
                const background = effectiveBackground(element);
                if (!foreground || !background) return [];
                const ratio = contrast(foreground, background);
                return ratio < 4.5 ? [`${label} ${ratio.toFixed(2)}:1`] : [];
              }),
        );
        return {
          lang: document.documentElement.lang,
          title,
          description,
          canonical,
          h1,
          h1Count: document.querySelectorAll("h1").length,
          contentText:
            document
              .querySelector(".seo-content")
              ?.textContent?.replace(/\s+/g, " ")
              .trim() ?? "",
          contentAssetCount: document.querySelectorAll(".visual-guide-item img")
            .length,
          contentSectionCount: document.querySelectorAll(".seo-content section")
            .length,
          faqCount: document.querySelectorAll(".faq-item").length,
          hreflangs,
          heroImage,
          ogImage,
          fragmentCount: document.querySelectorAll("fragment").length,
          brokenImages: [...document.images].filter(
            (image) => image.complete && image.naturalWidth === 0,
          ).length,
          darkContrastFailures,
        };
      });

      if (result.lang.toLowerCase() !== locale.lang.toLowerCase()) {
        failures.push(
          `${href}: lang=${result.lang || "空"}，期望 ${locale.lang}`,
        );
      }
      if (result.h1Count !== 1)
        failures.push(`${href}: H1 数量 ${result.h1Count}`);
      const primaryKeyword = result.h1.split(":")[0]?.trim() ?? result.h1;
      if (
        !primaryKeyword ||
        !result.title.toLowerCase().includes(primaryKeyword.toLowerCase())
      ) {
        failures.push(`${href}: Title 未包含页面主关键词/H1`);
      }
      if (
        !result.description.toLowerCase().includes(primaryKeyword.toLowerCase())
      ) {
        failures.push(`${href}: Description 未包含页面主关键词/H1`);
      }
      if (result.contentText.length < locale.minContentLength) {
        failures.push(
          `${href}: SEO 主体正文 ${result.contentText.length} 字符，期望至少 ${locale.minContentLength}`,
        );
      }
      if (result.contentAssetCount < 3) {
        failures.push(
          `${href}: 正文视觉资产 ${result.contentAssetCount} 张，期望至少 3 张`,
        );
      }
      if (locale.slug && result.contentSectionCount < 5) {
        failures.push(
          `${href}: SEO 主体区块 ${result.contentSectionCount} 个，期望至少 5 个`,
        );
      }
      if (locale.slug && result.faqCount < 4) {
        failures.push(`${href}: 专题 FAQ ${result.faqCount} 个，期望至少 4 个`);
      }
      if (locale.slug) {
        localeBodies.push({ href, text: result.contentText });
      }
      if (normalizePath(result.canonical) !== normalizePath(href)) {
        failures.push(`${href}: canonical 不自指 ${result.canonical}`);
      }
      if (result.fragmentCount > 0) {
        failures.push(
          `${href}: 输出了 ${result.fragmentCount} 个 <fragment> 标签`,
        );
      }
      if (result.brokenImages > 0) {
        failures.push(`${href}: ${result.brokenImages} 张图片加载失败`);
      }
      if (result.darkContrastFailures.length > 0) {
        failures.push(
          `${href}: 暗黑主题文字对比度不足 (${result.darkContrastFailures
            .slice(0, 6)
            .join(", ")})`,
        );
      }
      if (!result.heroImage) failures.push(`${href}: 缺少页面专属 Hero 图片`);
      if (
        locale.eastAsia &&
        result.heroImage &&
        !result.heroImage.includes("--east-asia.webp")
      ) {
        failures.push(
          `${href}: 东亚语言未使用东亚 Hero 资产 ${result.heroImage}`,
        );
      }
      if (!locale.eastAsia && result.heroImage.includes("--east-asia.webp")) {
        failures.push(
          `${href}: 非东亚语言错误使用东亚 Hero 资产 ${result.heroImage}`,
        );
      }
      if (!result.ogImage || result.ogImage.endsWith("/images/og-seo.png")) {
        failures.push(`${href}: 缺少页面专属 OG 图片`);
      }

      const actualHreflangs = new Set(result.hreflangs);
      if (
        actualHreflangs.size !== expectedHreflangs.size ||
        [...expectedHreflangs].some((value) => !actualHreflangs.has(value))
      ) {
        failures.push(
          `${href}: hreflang 不完整 (${[...actualHreflangs].join(", ")})`,
        );
      }
    }

    for (let left = 0; left < localeBodies.length; left += 1) {
      for (let right = left + 1; right < localeBodies.length; right += 1) {
        const score = similarity(
          localeBodies[left].text,
          localeBodies[right].text,
        );
        if (score >= 0.9) {
          failures.push(
            `${localeBodies[left].href} 与 ${localeBodies[right].href}: 主体内容相似度 ${score.toFixed(3)}，高于 0.900`,
          );
        }
      }
    }
  }

  await page.close();
} finally {
  await browser.close();
}

console.log("Footer SEO acceptance audit");
console.log(`Base URL: ${baseUrl}`);
console.log(`Locales: ${locales.length}`);
console.log(`Footer target groups: ${footerTargetCount}`);
console.log(`Pages checked: ${pagesChecked}`);
console.log(`Failures: ${failures.length}`);

for (const failure of [...new Set(failures)]) {
  console.log(`[FAIL] ${failure}`);
}

if (failures.length > 0) process.exitCode = 1;
