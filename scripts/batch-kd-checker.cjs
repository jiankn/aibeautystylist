#!/usr/bin/env node

/**
 * 多语言 SEO 关键词 KD 批量查询工具
 *
 * 从 MULTILINGUAL_SEO_KEYWORDS.md 提取关键词，批量查询 KD 难度，
 * 输出为带 KD 分数的 CSV 文件。
 *
 * 使用方式：
 *   node scripts/batch-kd-checker.js --provider=seoreviewtools --key=YOUR_API_KEY
 *   node scripts/batch-kd-checker.js --provider=ahrefs --key=YOUR_API_KEY
 *   node scripts/batch-kd-checker.js --provider=dry-run  (只提取关键词，不查询)
 *
 *   支持的 provider：
 *     dataforseo       — DataForSEO API（免费注册，送 $1 试用，无需信用卡）
 *                        注册地址：https://app.dataforseo.com/register
 *                        登录用户名/密码就是 API key
 *                        Bulk Keyword Difficulty：最多 1000 关键词/请求
 *                        费用：约 $0.0001/关键词
 *
 *     seoreviewtools  — SEO Review Tools API（15 天免费试用）
 *                       注册地址：https://api.seoreviewtools.com/
 *                       Bulk KD：12 credits/请求（最多 1000 关键词）
 *
 *     ahrefs          — Ahrefs API v3（需付费订阅）
 *                       注册地址：https://ahrefs.com/
 *                       Keywords Explorer Overview：10 units/关键词
 *
 *     dry-run         — 只提取关键词列表，不查询 API
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

// ── 参数解析 ──────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name) {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split("=").slice(1).join("=") : null;
}

const provider = getArg("provider") || "dry-run";
const apiKey = getArg("key") || "";
const apiLogin = getArg("login") || ""; // DataForSEO 需要 login
const langFilter = getArg("lang") || null; // 可选：只查某个语言，如 --lang=en
const outputFile =
  getArg("output") || path.join(__dirname, "..", "keyword-kd-results.csv");

// ── 从 Markdown 提取关键词 ───────────────────────────────
function extractKeywords() {
  const mdPath = path.join(__dirname, "..", "MULTILINGUAL_SEO_KEYWORDS.md");
  const content = fs.readFileSync(mdPath, "utf-8");
  const lines = content.split("\n");

  const keywords = [];
  let currentLang = null;
  let currentCategory = null;

  // 语言映射
  const langPatterns = {
    "## 1. English": "en",
    "## 2. Deutsch": "de",
    "## 3. Français": "fr",
    "## 4. 日本語": "ja",
    "## 5. 한국어": "ko",
    "## 6. 繁體中文": "zh-TW",
    "## 7. Español": "es",
    "## 8. Português": "pt-BR",
  };

  // 分类映射
  const categoryPatterns = {
    风格: "style",
    场景: "scenario",
    人群: "demographic",
    特征: "demographic",
    教程: "tutorial",
    新手: "tutorial",
    AI: "ai_tech",
    技术: "ai_tech",
    产品: "product",
    购买: "product",
    隐私: "trust",
    信任: "trust",
    拉美特有: "regional",
    巴西特有: "regional",
  };

  for (const line of lines) {
    // 检测语言章节
    for (const [pattern, lang] of Object.entries(langPatterns)) {
      if (line.startsWith(pattern)) {
        currentLang = lang;
        break;
      }
    }

    // 检测分类
    if (line.startsWith("###")) {
      for (const [pattern, cat] of Object.entries(categoryPatterns)) {
        if (line.includes(pattern)) {
          currentCategory = cat;
          break;
        }
      }
      continue;
    }

    // 跳过附录部分
    if (line.startsWith("## 附录")) {
      break;
    }

    // 解析表格行
    if (line.startsWith("|") && currentLang && currentCategory) {
      const cells = line
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length >= 2) {
        // 跳过表头行
        if (
          cells[0].includes("关键词") ||
          cells[0].includes("keyword") ||
          cells[0].includes("---")
        ) {
          continue;
        }
        // 跳过分隔行
        if (cells[0].startsWith("-")) continue;

        const keyword = cells[0].trim();
        // 排除非关键词行
        if (
          keyword.length > 0 &&
          !keyword.startsWith("#") &&
          keyword.length < 80 &&
          !keyword.includes("搜索意图") &&
          !keyword.includes("说明")
        ) {
          keywords.push({
            keyword,
            lang: currentLang,
            category: currentCategory,
            description: cells[1] || "",
          });
        }
      }
    }
  }

  return keywords;
}

// ── HTTP 请求封装 ──────────────────────────────────────────
function httpRequest(url, options, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: options.headers || {},
    };

    const req = https.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data),
          });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(typeof body === "string" ? body : JSON.stringify(body));
    req.end();
  });
}

// ── HTTP 请求（带 Basic Auth）──────────────────────────────
function httpBasicAuth(url, login, password, body = null) {
  const auth = Buffer.from(`${login}:${password}`).toString("base64");
  return httpRequest(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
    },
    body ? JSON.stringify(body) : null,
  );
}

// ── DataForSEO 批量查询 ────────────────────────────────────
//
// 使用 DataForSEO Labs Google Bulk Keyword Difficulty Live API
// 文档：https://docs.dataforseo.com/v3/dataforseo_labs-google-bulk_keyword_difficulty-live/
// 认证：HTTP Basic Auth，login = 注册用户名，password = 密码
async function queryDataForSEO(keywords) {
  const results = [];
  const batchSize = 500; // DataForSEO 最多 1000 关键词/请求，这里保守 500

  if (!apiLogin) {
    console.error("❌ DataForSEO 需要 --login=你的登录用户名");
    console.error("   （登录名和密码就是你在 dataforseo.com 注册的账号凭证）");
    process.exit(1);
  }

  // 语言到 DataForSEO location_name 的映射
  const langToLocation = {
    en: "United States",
    de: "Germany",
    fr: "France",
    ja: "Japan",
    ko: "South Korea",
    "zh-TW": "Taiwan",
    es: "Spain",
    "pt-BR": "Brazil",
  };

  // 按语言分批
  const langGroups = {};
  for (const kw of keywords) {
    if (!langGroups[kw.lang]) langGroups[kw.lang] = [];
    langGroups[kw.lang].push(kw);
  }

  for (const [lang, kws] of Object.entries(langGroups)) {
    const location = langToLocation[lang] || "United States";
    console.log(
      `\n📊 查询 ${lang} (${kws.length} 个关键词, 国家: ${location})...`,
    );

    for (let i = 0; i < kws.length; i += batchSize) {
      const batch = kws.slice(i, i + batchSize);
      const kwStrings = batch.map((k) => k.keyword);

      const payload = [
        {
          keywords: kwStrings,
          location_name: location,
          language_name:
            lang === "zh-TW"
              ? "Chinese (Traditional)"
              : lang === "en"
                ? "English"
                : lang === "de"
                  ? "German"
                  : lang === "fr"
                    ? "French"
                    : lang === "ja"
                      ? "Japanese"
                      : lang === "ko"
                        ? "Korean"
                        : lang === "es"
                          ? "Spanish"
                          : lang === "pt-BR"
                            ? "Portuguese"
                            : "English",
        },
      ];

      try {
        const res = await httpBasicAuth(
          "https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_keyword_difficulty/live",
          apiLogin,
          apiKey,
          payload,
        );

        if (res.status === 200 && res.body) {
          const body = res.body;

          // DataForSEO 响应结构：tasks[0].result -> 数组，每项含 items[]
          if (body.tasks && body.tasks.length > 0) {
            const taskResult = body.tasks[0].result;
            const kdMap = {};

            // Bulk KD 返回结构：result[0].items 是数组
            if (Array.isArray(taskResult) && taskResult.length > 0) {
              const items = taskResult[0].items || [];
              for (const item of items) {
                kdMap[item.keyword] = {
                  kd: item.keyword_difficulty,
                  vol: null, // Bulk KD 不返回搜索量
                };
              }
            }

            for (const kw of batch) {
              const data = kdMap[kw.keyword] || { kd: null, vol: null };
              results.push({
                keyword: kw.keyword,
                lang,
                kd: data.kd,
                searchVolume: data.vol,
              });
            }

            console.log(
              `  ✅ 批次 ${Math.floor(i / batchSize) + 1}: ${batch.length} 个关键词`,
            );
          } else if (
            body.tasks &&
            body.tasks.length > 0 &&
            body.tasks[0].status_code === 20000
          ) {
            // 成功但无结果
            for (const kw of batch) {
              results.push({
                keyword: kw.keyword,
                lang,
                kd: null,
                searchVolume: null,
              });
            }
          } else {
            // 错误
            const errMsg =
              body.tasks?.[0]?.status_message ||
              JSON.stringify(body).substring(0, 200);
            console.log(`  ❌ 错误: ${errMsg}`);
            for (const kw of batch) {
              results.push({
                keyword: kw.keyword,
                lang,
                kd: null,
                searchVolume: null,
                error: errMsg,
              });
            }
          }
        } else if (res.status === 401) {
          console.error("  ❌ 认证失败 — 请检查 --login 和 --key 是否正确");
          process.exit(1);
        } else if (res.status === 429) {
          console.log(`  ⚠️ 速率限制，等待 30 秒...`);
          await sleep(30000);
          i -= batchSize;
        } else {
          console.log(`  ❌ HTTP ${res.status}`);
          for (const kw of batch) {
            results.push({
              keyword: kw.keyword,
              lang,
              kd: null,
              searchVolume: null,
              error: `HTTP ${res.status}`,
            });
          }
        }

        // DataForSEO 限流：建议间隔 1 秒
        await sleep(1200);
      } catch (err) {
        console.log(`  ❌ 请求失败: ${err.message}`);
        for (const kw of batch) {
          results.push({
            keyword: kw.keyword,
            lang,
            kd: null,
            searchVolume: null,
            error: err.message,
          });
        }
      }
    }
  }

  return results;
}

// ── SEO Review Tools 批量查询 ──────────────────────────────
async function querySEOReviewTools(keywords) {
  const results = [];
  const batchSize = 100; // 每批 100 个关键词

  // 按语言分批，因为不同语言的搜索国家不同
  const langGroups = {};
  for (const kw of keywords) {
    if (!langGroups[kw.lang]) langGroups[kw.lang] = [];
    langGroups[kw.lang].push(kw);
  }

  // 语言到国家的映射
  const langToCountry = {
    en: "us",
    de: "de",
    fr: "fr",
    ja: "jp",
    ko: "kr",
    "zh-TW": "tw",
    es: "es",
    "pt-BR": "br",
  };

  for (const [lang, kws] of Object.entries(langGroups)) {
    const country = langToCountry[lang] || "us";
    console.log(
      `\n📊 查询 ${lang} (${kws.length} 个关键词, 国家: ${country})...`,
    );

    for (let i = 0; i < kws.length; i += batchSize) {
      const batch = kws.slice(i, i + batchSize);
      const kwList = batch.map((k) => k.keyword).join("\n");

      try {
        await httpRequest(
          "https://api.seoreviewtools.com/keyword-difficulty-checker-api/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${apiKey}`,
            },
          },
          null,
        );

        // 备选：GET 方式
        const getUrl = `https://api.seoreviewtools.com/keyword-difficulty-checker-api/?auth_token=${apiKey}&data=${encodeURIComponent(kwList)}&country=${country}`;
        const getRes = await httpRequest(getUrl, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (getRes.status === 200 && getRes.body) {
          const body = getRes.body;
          // 解析响应
          if (body.result) {
            for (const [kw, data] of Object.entries(body.result)) {
              results.push({
                keyword: kw,
                lang,
                kd: data.difficulty || data.kd || data.score || null,
                searchVolume: data.volume || data.search_volume || null,
              });
            }
          }
          console.log(
            `  ✅ 批次 ${Math.floor(i / batchSize) + 1}: ${batch.length} 个关键词`,
          );
        } else if (getRes.status === 429) {
          console.log(`  ⚠️ 速率限制，等待 60 秒...`);
          await sleep(60000);
          i -= batchSize; // 重试本批
        } else {
          console.log(
            `  ❌ 错误 ${getRes.status}:`,
            typeof getRes.body === "string"
              ? getRes.body.substring(0, 200)
              : JSON.stringify(getRes.body).substring(0, 200),
          );
          // 标记为 null
          for (const kw of batch) {
            results.push({
              keyword: kw.keyword,
              lang,
              kd: null,
              searchVolume: null,
              error: `HTTP ${getRes.status}`,
            });
          }
        }

        // 请求间隔，避免触发限流
        await sleep(1500);
      } catch (err) {
        console.log(`  ❌ 请求失败: ${err.message}`);
        for (const kw of batch) {
          results.push({
            keyword: kw.keyword,
            lang,
            kd: null,
            searchVolume: null,
            error: err.message,
          });
        }
      }
    }
  }

  return results;
}

// ── Ahrefs 查询（需要付费 API key）─────────────────────────
async function queryAhrefs(keywords) {
  const results = [];
  let count = 0;

  for (const kw of keywords) {
    count++;
    if (count % 10 === 0) {
      console.log(`  已查询 ${count}/${keywords.length}...`);
    }

    try {
      const url = `https://api.ahrefs.com/v3/keywords-explorer/overview?keyword=${encodeURIComponent(kw.keyword)}&mode=exact`;
      const res = await httpRequest(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      });

      if (res.status === 200 && res.body) {
        const data = res.body;
        results.push({
          keyword: kw.keyword,
          lang: kw.lang,
          kd: data.difficulty || null,
          searchVolume: data.volume || data.search_volume || null,
          cpc: data.cpc || null,
          clicks: data.clicks || null,
        });
      } else if (res.status === 429) {
        console.log(`  ⚠️ Ahrefs 速率限制，等待 60 秒...`);
        await sleep(60000);
        count--;
      } else {
        results.push({
          keyword: kw.keyword,
          lang: kw.lang,
          kd: null,
          searchVolume: null,
          error: `HTTP ${res.status}`,
        });
      }

      // Ahrefs 限流：每秒不超过 2 个请求
      await sleep(600);
    } catch (err) {
      results.push({
        keyword: kw.keyword,
        lang: kw.lang,
        kd: null,
        searchVolume: null,
        error: err.message,
      });
    }
  }

  return results;
}

// ── 工具函数 ──────────────────────────────────────────────
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function kdToLevel(kd) {
  if (kd === null || kd === undefined) return "无数据";
  if (kd <= 10) return "极低";
  if (kd <= 25) return "低";
  if (kd <= 50) return "中";
  if (kd <= 75) return "高";
  return "极高";
}

// ── 输出 CSV ──────────────────────────────────────────────
function writeCSV(results, keywords) {
  const header =
    "language,category,keyword,kd_score,kd_level,search_volume,error\n";

  // 为结果补充分类信息
  const kwMap = {};
  for (const kw of keywords) {
    kwMap[`${kw.lang}::${kw.keyword}`] = kw;
  }

  let csv = header;
  for (const r of results) {
    const meta = kwMap[`${r.lang}::${r.keyword}`] || {};
    const kd = r.kd !== null && r.kd !== undefined ? r.kd : "";
    const level = r.kd !== null && r.kd !== undefined ? kdToLevel(r.kd) : "";
    const vol = r.searchVolume || "";
    const err = r.error || "";
    const cat = meta.category || "";

    // CSV 转义
    const kwEscaped = r.keyword.includes(",") ? `"${r.keyword}"` : r.keyword;

    csv += `${r.lang},${cat},${kwEscaped},${kd},${level},${vol},${err}\n`;
  }

  fs.writeFileSync(outputFile, csv, "utf-8");
  console.log(`\n✅ 结果已保存到: ${outputFile}`);
}

// ── 统计输出 ──────────────────────────────────────────────
function printStats(results) {
  const total = results.length;
  const withKd = results.filter((r) => r.kd !== null && r.kd !== undefined);
  const nullKd = results.filter((r) => r.kd === null || r.kd === undefined);
  const levels = {
    极低: withKd.filter((r) => r.kd <= 10).length,
    低: withKd.filter((r) => r.kd > 10 && r.kd <= 25).length,
    中: withKd.filter((r) => r.kd > 25 && r.kd <= 50).length,
    高: withKd.filter((r) => r.kd > 50 && r.kd <= 75).length,
    极高: withKd.filter((r) => r.kd > 75).length,
  };

  console.log("\n═══════════════════════════════════════════");
  console.log("📈 KD 分布统计（DataForSEO 评分，0–100）");
  console.log("═══════════════════════════════════════════");
  console.log(`总计关键词: ${total}`);
  console.log(`已获取 KD: ${withKd.length}`);
  console.log(`无 KD 数据: ${nullKd.length}（长尾词，搜索量不足，KD 不计算）`);
  console.log("───────────────────────────────────────────");
  console.log(`🟢 极低 (0-10):  ${levels["极低"]} 个  ← 最优先做`);
  console.log(`🟡 低   (11-25): ${levels["低"]} 个  ← 优先做`);
  console.log(`🟠 中   (26-50): ${levels["中"]} 个  ← 需要内容质量支撑`);
  console.log(`🔴 高   (51-75): ${levels["高"]} 个  ← 新站不建议直接打`);
  console.log(`⛔ 极高 (76-100): ${levels["极高"]} 个  ← 完全不碰`);
  console.log("═══════════════════════════════════════════\n");

  // 按语言统计
  const langStats = {};
  for (const r of results) {
    if (!langStats[r.lang])
      langStats[r.lang] = { total: 0, withKd: 0, avgKd: 0, kds: [] };
    langStats[r.lang].total++;
    if (r.kd !== null && r.kd !== undefined) {
      langStats[r.lang].withKd++;
      langStats[r.lang].kds.push(r.kd);
    }
  }

  console.log("📊 各语言统计:");
  for (const [lang, stats] of Object.entries(langStats)) {
    const avg =
      stats.kds.length > 0
        ? (stats.kds.reduce((a, b) => a + b, 0) / stats.kds.length).toFixed(1)
        : "N/A";
    console.log(
      `  ${lang}: ${stats.withKd}/${stats.total} 已查, 平均 KD: ${avg}`,
    );
  }
  console.log();
}

// ── 主流程 ────────────────────────────────────────────────
async function main() {
  console.log("🔍 多语言 SEO 关键词 KD 批量查询工具");
  console.log("═══════════════════════════════════════════\n");

  // 1. 提取关键词
  console.log("📖 从 MULTILINGUAL_SEO_KEYWORDS.md 提取关键词...");
  let keywords = extractKeywords();

  if (langFilter) {
    keywords = keywords.filter((kw) => kw.lang === langFilter);
    console.log(`🔎 只查询语言: ${langFilter}`);
  }

  console.log(`✅ 提取到 ${keywords.length} 个关键词\n`);

  // 按语言分组输出
  const langCounts = {};
  for (const kw of keywords) {
    langCounts[kw.lang] = (langCounts[kw.lang] || 0) + 1;
  }
  for (const [lang, count] of Object.entries(langCounts)) {
    console.log(`  ${lang}: ${count} 个`);
  }

  if (provider === "dry-run") {
    console.log("\n🏁 Dry run 模式 — 只提取关键词，不查询 API");
    console.log("\n💡 使用方法：");
    console.log("  推荐（免费注册 + 按量付费）:");
    console.log("  1. 注册 DataForSEO: https://app.dataforseo.com/register");
    console.log("  2. 获取登录名和密码（就是你的账号凭证）");
    console.log(
      "  3. 运行: node scripts/batch-kd-checker.cjs --provider=dataforseo --login=你的登录名 --key=你的密码",
    );
    console.log("\n  其他选项：");
    console.log(
      "  node scripts/batch-kd-checker.cjs --provider=seoreviewtools --key=YOUR_KEY",
    );
    console.log(
      "  node scripts/batch-kd-checker.cjs --provider=ahrefs --key=YOUR_KEY",
    );
    console.log("\n  只查某一种语言:");
    console.log(
      "  node scripts/batch-kd-checker.cjs --provider=dataforseo --login=YOUR_LOGIN --key=YOUR_PASS --lang=en",
    );

    // 输出关键词列表到文件
    const listFile = path.join(__dirname, "..", "keyword-list-all.txt");
    const listContent = keywords
      .map((kw) => `${kw.lang}\t${kw.category}\t${kw.keyword}`)
      .join("\n");
    fs.writeFileSync(listFile, listContent, "utf-8");
    console.log(`\n📝 关键词列表已保存到: ${listFile}`);
    return;
  }

  if (!apiKey) {
    console.error("❌ 请提供 API key: --key=YOUR_API_KEY");
    process.exit(1);
  }

  // 2. 查询 KD
  let results;
  console.log(`\n🚀 使用 ${provider} 查询 KD...\n`);

  if (provider === "dataforseo") {
    results = await queryDataForSEO(keywords);
  } else if (provider === "seoreviewtools") {
    results = await querySEOReviewTools(keywords);
  } else if (provider === "ahrefs") {
    results = await queryAhrefs(keywords);
  } else {
    console.error(`❌ 不支持的 provider: ${provider}`);
    console.error(
      "支持的 provider: dataforseo, seoreviewtools, ahrefs, dry-run",
    );
    process.exit(1);
  }

  // 3. 输出结果
  writeCSV(results, keywords);
  printStats(results);
}

main().catch((err) => {
  console.error("❌ 运行错误:", err.message);
  process.exit(1);
});
