import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const roots = ["src"];
const extensions = new Set([".astro", ".ts", ".json"]);
const riskyPatterns = [
  "精准识别",
  "真实保证",
  "真实妆效满意度",
  "量身定制",
  "高保真",
  "30 秒内",
  "100% 隐私",
  "找到最适合",
  "立即升级",
  "报告资产",
];

function walk(dir) {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) return walk(fullPath);
    return fullPath;
  });
}

function extensionOf(file) {
  const index = file.lastIndexOf(".");
  return index >= 0 ? file.slice(index) : "";
}

const findings = [];

for (const root of roots) {
  for (const file of walk(root)) {
    if (!extensions.has(extensionOf(file))) continue;
    const content = readFileSync(file, "utf8");
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      riskyPatterns.forEach((pattern) => {
        if (line.includes(pattern)) {
          findings.push({
            file: relative(process.cwd(), file),
            line: index + 1,
            pattern,
          });
        }
      });
    });
  }
}

if (findings.length) {
  console.error("High-risk copy terms found:");
  findings.forEach((finding) => {
    console.error(
      `- ${finding.file}:${finding.line} contains "${finding.pattern}"`,
    );
  });
  process.exit(1);
}

console.log("Copy audit passed: no high-risk Chinese claim terms found.");
