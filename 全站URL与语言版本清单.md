# 全站 URL 与语言版本清单

更新时间：2026-06-14

## 语言范围

| 语言 | URL 前缀 | hreflang | sitemap 可索引 URL |
| --- | --- | --- | ---: |
| English | 无 | `en` | 63 |
| 简体中文 | `/zh-cn` | `zh-Hans` | 12 |
| Deutsch | `/de` | `de` | 29 |
| Français | `/fr` | `fr` | 38 |
| 日本語 | `/ja` | `ja` | 47 |
| 한국어 | `/ko` | `ko` | 40 |
| 繁體中文 | `/zh-tw` | `zh-Hant` | 35 |
| Español | `/es` | `es` | 31 |
| Português do Brasil | `/pt-br` | `pt-BR` | 36 |
| **合计** |  |  | **331** |

## Sitemap 清单

- `/sitemap.xml`
- `/sitemap-index.xml`
- `/sitemap-en.xml`
- `/sitemap-zh-cn.xml`
- `/sitemap-de.xml`
- `/sitemap-fr.xml`
- `/sitemap-ja.xml`
- `/sitemap-ko.xml`
- `/sitemap-zh-tw.xml`
- `/sitemap-es.xml`
- `/sitemap-pt-br.xml`

## 可访问核心产品路由

以下路由均支持九种语言前缀版本：

- `/`
- `/discover`
- `/tryon-free`
- `/diagnosis`
- `/pricing`
- `/blog`
- `/faq`
- `/support`
- `/about`
- `/privacy`
- `/terms`
- `/ai-disclaimer`
- `/login`
- `/reset-password`
- `/account`
- `/share-card`

示例：`/de/discover`、`/ja/diagnosis`、`/es/pricing`、`/zh-tw/terms`。

## 英文 SEO 页面类型

- 产品页：`/virtual-makeup-app`、`/ai-makeup-try-on`、`/ai-beauty-advisor`、`/virtual-makeup-tester`、`/personalized-makeup-recommendation`
- 妆容页：`/looks/*`
- 场景页：`/scenarios/*`
- 人群与特征页：`/for/*`
- 教程页：`/guides/*`
- 博客文章：`/blog/*`

## 多语言博客与 SEO 页面

多语言博客文章由 `src/data/localizedBlogContent.ts` 按根目录 `keyword-kd-results.csv` 的语言关键词池生成标题、摘要、正文、分类、关键词和 UI 文案。每种语言都有 10 篇博客文章，使用自 canonical、完整 hreflang，并进入对应 sitemap。

多语言 SEO 页面由 `src/i18n/localizedSeoPages.ts` 及其阶段文件维护，并按语言进入对应 sitemap。它们使用独立本地化标题、描述、H1、正文、canonical 和 hreflang。

## 索引策略

| 页面类型 | 索引规则 |
| --- | --- |
| 英文核心页和英文 SEO 页 | `index,follow`，进入英文 sitemap |
| 语言首页 | `index,follow`，进入对应语言 sitemap |
| 多语言博客首页和博客文章 | `index,follow`，进入对应语言 sitemap |
| 独立本地化 SEO 页 | `index,follow`，进入对应语言 sitemap |
| 通用本地化应用页 | 可访问；没有独立 SEO 意图时 `noindex,follow` 并 canonical 到主版本 |
| 登录、账户、重置、分享和错误页 | 不进入 sitemap，按页面用途 noindex |
| API、静态资源和基础设施路径 | 不进入页面 sitemap |

该策略避免将翻译后的应用壳页面与独立 SEO 落地页同时索引，降低重复内容和关键词竞争风险。

## 最终技术验证

```text
npm.cmd run audit:indexing
331 URLs checked
0 errors
0 warnings
```

每个 sitemap URL 已检查状态码、robots、canonical、title、description、H1、hreflang 和重复元信息。
