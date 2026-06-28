#!/usr/bin/env node

import { access } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = (process.env.AUDIT_BASE_URL ?? "http://127.0.0.1:4321").replace(
  /\/+$/,
  "",
);
const browserCandidates = [
  process.env.EDGE_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].filter(Boolean);
const locales = [
  { slug: "", lang: "en" },
  { slug: "zh-cn", lang: "zh-CN" },
  { slug: "de", lang: "de-DE" },
  { slug: "fr", lang: "fr-FR" },
  { slug: "ja", lang: "ja-JP" },
  { slug: "ko", lang: "ko-KR" },
  { slug: "zh-tw", lang: "zh-TW" },
  { slug: "es", lang: "es-ES" },
  { slug: "pt-br", lang: "pt-BR" },
];
const routes = [
  "/",
  "/discover",
  "/tryon",
  "/diagnosis",
  "/pricing",
  "/faq",
  "/support",
  "/about",
  "/privacy",
  "/terms",
  "/ai-disclaimer",
  "/login",
  "/reset-password",
  "/blog",
];
const legacyEnglishMarkers = [
  "Support that starts with the problem",
  "Find the answer, then get back to your task",
  "A clearer way to explore makeup before you commit",
  "Welcome back",
  "Create an account",
  "Set a new password",
  "Monthly",
  "Save 2 months",
  "Questions before upgrading",
  "Billing and policy",
  "Confirm subscription",
];
const simplifiedChineseMarkers = [
  "服务条款",
  "AI 免责声明",
  "隐私政策",
  "使用产品",
  "提交支持工单",
  "先找到答案，再继续完成任务",
];

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
if (!executablePath) {
  throw new Error("未找到可用于上线审计的 Edge 或 Chrome。");
}

const failures = [];
const warnings = [];
const browser = await chromium.launch({ executablePath, headless: true });

try {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 375, height: 812 },
  ]) {
    const page = await browser.newPage({ viewport });
    const localHostname = new URL(baseUrl).hostname;
    await page.context().route("**/*", (route) => {
      const requestUrl = new URL(route.request().url());
      return requestUrl.protocol.startsWith("http") &&
        requestUrl.hostname !== localHostname
        ? route.abort()
        : route.continue();
    });

    for (const locale of locales) {
      for (const route of routes) {
        const pathname =
          `${locale.slug ? `/${locale.slug}` : ""}${route === "/" ? "" : route}` ||
          "/";
        const url = `${baseUrl}${pathname}`;
        const response = await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30_000,
        });
        if (!response?.ok()) {
          failures.push(
            `${viewport.name} ${pathname}: HTTP ${response?.status() ?? "无响应"}`,
          );
          continue;
        }

        const result = await page.evaluate(() => {
          const visibleText =
            document.body?.innerText?.replace(/\s+/g, " ").trim() ?? "";
          const authPoster = document.querySelector(".auth-poster");
          const authMain = document.querySelector(".auth-main");
          const posterStyle = authPoster
            ? getComputedStyle(authPoster)
            : undefined;
          const mainStyle = authMain ? getComputedStyle(authMain) : undefined;
          return {
            lang: document.documentElement.lang,
            h1Count: document.querySelectorAll("h1").length,
            overflow:
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth,
            missingAlt: [...document.images].filter(
              (image) => !image.hasAttribute("alt"),
            ).length,
            unnamedButtons: [...document.querySelectorAll("button")].filter(
              (button) =>
                !button.textContent?.trim() &&
                !button.getAttribute("aria-label") &&
                !button.getAttribute("title"),
            ).length,
            authPoster: authPoster
              ? {
                  display: posterStyle?.display ?? "",
                  backgroundImage: posterStyle?.backgroundImage ?? "",
                  mainBackgroundImage: mainStyle?.backgroundImage ?? "",
                  width: Math.round(authPoster.getBoundingClientRect().width),
                  height: Math.round(authPoster.getBoundingClientRect().height),
                }
              : null,
            text: visibleText,
          };
        });

        if (result.lang.toLowerCase() !== locale.lang.toLowerCase()) {
          failures.push(
            `${viewport.name} ${pathname}: lang=${result.lang || "空"}，期望 ${locale.lang}`,
          );
        }
        if (result.h1Count !== 1) {
          failures.push(
            `${viewport.name} ${pathname}: H1 数量 ${result.h1Count}，期望 1`,
          );
        }
        if (result.overflow > 1) {
          failures.push(
            `${viewport.name} ${pathname}: 横向溢出 ${result.overflow}px`,
          );
        }
        if (result.missingAlt > 0) {
          failures.push(
            `${viewport.name} ${pathname}: ${result.missingAlt} 张图片缺少 alt`,
          );
        }
        if (result.unnamedButtons > 0) {
          failures.push(
            `${viewport.name} ${pathname}: ${result.unnamedButtons} 个按钮无可访问名称`,
          );
        }
        if (viewport.name === "desktop" && route === "/login") {
          if (!result.authPoster) {
            failures.push(`${viewport.name} ${pathname}: 缺少登录海报区域`);
          } else {
            if (!result.authPoster.backgroundImage.includes("login-hero")) {
              failures.push(
                `${viewport.name} ${pathname}: 登录海报未在 poster 容器承载图片`,
              );
            }
            if (result.authPoster.mainBackgroundImage !== "none") {
              failures.push(
                `${viewport.name} ${pathname}: 登录海报图片仍铺在整屏背景`,
              );
            }
            if (
              result.authPoster.display === "none" ||
              result.authPoster.width < 520 ||
              result.authPoster.height < 600
            ) {
              failures.push(
                `${viewport.name} ${pathname}: PC 登录海报展示面积不足 ${result.authPoster.width}x${result.authPoster.height}`,
              );
            }
          }
        }

        if (locale.slug && locale.slug !== "zh-cn") {
          const englishMarker = legacyEnglishMarkers.find((marker) =>
            result.text.includes(marker),
          );
          if (englishMarker) {
            failures.push(
              `${viewport.name} ${pathname}: 检测到英文回退文案 “${englishMarker}”`,
            );
          }
        }
        if (locale.slug && locale.slug !== "zh-cn" && locale.slug !== "zh-tw") {
          const chineseMarker = simplifiedChineseMarkers.find((marker) =>
            result.text.includes(marker),
          );
          if (chineseMarker) {
            failures.push(
              `${viewport.name} ${pathname}: 检测到简体中文回退文案 “${chineseMarker}”`,
            );
          }
        }
        if (result.text.length < 80) {
          warnings.push(`${viewport.name} ${pathname}: 可见正文偏少`);
        }
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}

console.log("Launch acceptance audit");
console.log(`Base URL: ${baseUrl}`);
console.log(`Locales: ${locales.length}`);
console.log(`Core routes: ${routes.length}`);
console.log(`Viewport/page checks: ${locales.length * routes.length * 2}`);
console.log(`Failures: ${failures.length}`);
console.log(`Warnings: ${warnings.length}`);

for (const failure of [...new Set(failures)]) {
  console.log(`[FAIL] ${failure}`);
}
for (const warning of [...new Set(warnings)]) {
  console.log(`[WARN] ${warning}`);
}

if (failures.length > 0) process.exitCode = 1;
