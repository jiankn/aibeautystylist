#!/usr/bin/env node

const DEFAULT_BASE_URL = "http://127.0.0.1:4321";
const baseUrl = new URL(process.env.AUDIT_BASE_URL || DEFAULT_BASE_URL);
const sitemapPath = process.env.AUDIT_SITEMAP_PATH || "/sitemap.xml";
const minInternalLinks = Number(process.env.AUDIT_MIN_INTERNAL_LINKS || 1);

const issues = [];
const pages = [];

function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = "";
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.href;
}

function toLocalUrl(sitemapLoc) {
  const loc = new URL(sitemapLoc);
  return new URL(`${loc.pathname}${loc.search}`, baseUrl).href;
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function stripTags(value) {
  return decodeEntities(
    value
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function matchContent(html, selector) {
  const patterns = {
    title: /<title[^>]*>([\s\S]*?)<\/title>/i,
    description:
      /<meta\b(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/i,
    robots:
      /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["']([^"']*)["'])[^>]*>/i,
    canonical:
      /<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']([^"']*)["'])[^>]*>/i,
  };
  const match = html.match(patterns[selector]);
  return decodeEntities(match?.[1] ?? "").trim();
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) =>
    decodeEntities(match[1].trim()),
  );
}

function extractJsonLdBlocks(html) {
  return [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ].map((match) => match[1].trim());
}

function countH1(html) {
  return [...html.matchAll(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi)].length;
}

function countInternalLinks(html) {
  const hrefs = [
    ...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi),
  ].map((match) => decodeEntities(match[1]));
  return hrefs.filter((href) => {
    if (!href || href.startsWith("#")) return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    try {
      const url = new URL(href, baseUrl);
      return url.origin === baseUrl.origin && url.pathname !== "/";
    } catch {
      return false;
    }
  }).length;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xml,text/xml;q=0.9,*/*;q=0.8",
    },
  });
  const body = await response.text();
  return { response, body };
}

async function loadSitemapUrls() {
  const sitemapUrl = new URL(sitemapPath, baseUrl).href;
  const { response, body } = await fetchText(sitemapUrl);

  if (!response.ok) {
    issues.push({
      severity: "error",
      url: sitemapUrl,
      message: `Sitemap fetch failed with HTTP ${response.status}`,
    });
    return [];
  }

  const locs = extractLocs(body);
  if (body.includes("<sitemapindex")) {
    const nested = [];
    for (const loc of locs) {
      const childUrl = toLocalUrl(loc);
      const child = await fetchText(childUrl);
      if (!child.response.ok) {
        issues.push({
          severity: "error",
          url: loc,
          message: `Child sitemap fetch failed with HTTP ${child.response.status}`,
        });
        continue;
      }
      nested.push(...extractLocs(child.body));
    }
    return nested;
  }

  return locs;
}

function auditPage(sitemapLoc, html, status) {
  const title = stripTags(matchContent(html, "title"));
  const description = matchContent(html, "description");
  const robots = matchContent(html, "robots").toLowerCase();
  const canonical = matchContent(html, "canonical");
  const h1Count = countH1(html);
  const internalLinkCount = countInternalLinks(html);
  const jsonLdBlocks = extractJsonLdBlocks(html);

  const page = {
    sitemapLoc,
    title,
    description,
    robots,
    canonical,
    h1Count,
    internalLinkCount,
  };
  pages.push(page);

  if (status !== 200) {
    issues.push({
      severity: "error",
      url: sitemapLoc,
      message: `Sitemap URL returned HTTP ${status}`,
    });
  }

  if (robots.includes("noindex")) {
    issues.push({
      severity: "error",
      url: sitemapLoc,
      message: "Sitemap URL has noindex robots meta",
    });
  }

  if (!canonical) {
    issues.push({
      severity: "error",
      url: sitemapLoc,
      message: "Missing canonical link",
    });
  } else if (normalizeUrl(canonical) !== normalizeUrl(sitemapLoc)) {
    issues.push({
      severity: "error",
      url: sitemapLoc,
      message: `Canonical mismatch: ${canonical}`,
    });
  }

  if (h1Count !== 1) {
    issues.push({
      severity: "error",
      url: sitemapLoc,
      message: `Expected exactly 1 H1, found ${h1Count}`,
    });
  }

  if (internalLinkCount < minInternalLinks) {
    issues.push({
      severity: "warning",
      url: sitemapLoc,
      message: `Low internal link count: ${internalLinkCount}`,
    });
  }

  for (const [index, jsonLd] of jsonLdBlocks.entries()) {
    try {
      JSON.parse(jsonLd);
    } catch (error) {
      issues.push({
        severity: "error",
        url: sitemapLoc,
        message: `Invalid JSON-LD block ${index + 1}: ${error.message}`,
      });
    }
  }
}

function auditDuplicates() {
  const seenTitles = new Map();
  const seenDescriptions = new Map();

  for (const page of pages) {
    if (page.title) {
      const existing = seenTitles.get(page.title);
      if (existing) {
        issues.push({
          severity: "warning",
          url: page.sitemapLoc,
          message: `Duplicate title also used by ${existing}`,
        });
      } else {
        seenTitles.set(page.title, page.sitemapLoc);
      }
    }

    if (page.description) {
      const existing = seenDescriptions.get(page.description);
      if (existing) {
        issues.push({
          severity: "warning",
          url: page.sitemapLoc,
          message: `Duplicate description also used by ${existing}`,
        });
      } else {
        seenDescriptions.set(page.description, page.sitemapLoc);
      }
    }
  }
}

function printReport(urls) {
  const errorCount = issues.filter(
    (issue) => issue.severity === "error",
  ).length;
  const warningCount = issues.filter(
    (issue) => issue.severity === "warning",
  ).length;

  console.log("Indexing audit");
  console.log(`Base URL: ${baseUrl.href}`);
  console.log(`Sitemap path: ${sitemapPath}`);
  console.log(`URLs checked: ${urls.length}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Warnings: ${warningCount}`);

  if (issues.length > 0) {
    console.log("");
    for (const issue of issues) {
      console.log(`[${issue.severity.toUpperCase()}] ${issue.url}`);
      console.log(`  ${issue.message}`);
    }
  }

  if (errorCount > 0) process.exitCode = 1;
}

const urls = await loadSitemapUrls();

for (const sitemapLoc of urls) {
  const localUrl = toLocalUrl(sitemapLoc);
  try {
    const { response, body } = await fetchText(localUrl);
    auditPage(sitemapLoc, body, response.status);
  } catch (error) {
    issues.push({
      severity: "error",
      url: sitemapLoc,
      message: `Fetch failed: ${error.message}`,
    });
  }
}

auditDuplicates();
printReport(urls);
