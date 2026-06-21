# DataForSEO 与 AIsa 示例

目的：后续拿到 API key 后，用同一批关键词跑 KD、搜索量和 SERP 证据，给上线关键词做最终验收。默认示例不发请求，只有加 `--execute` 才会真实调用。

## 凭据

在本地 `.dev.vars` 里填真实值，不要提交：

```dotenv
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=
AISA_API_KEY=
```

DataForSEO 官方接口使用 HTTP Basic Auth，用户名和密码来自 `https://app.dataforseo.com/api-access`。AIsa 通过 Bearer token 调用 `https://api.aisa.one/apis/v1` 下的 DataForSEO 路由。

注意：DataForSEO 和 AIsa 的 DataForSEO 路由都使用 task array 请求体，例如 `[{ "keywords": [...], "location_name": "...", "language_name": "..." }]`。如果 AIsa 返回 `40503 POST Data Is Invalid. An ARRAY of tasks is expected.`，说明请求体被写成了单个 object。

## AIsa 多语言 SEO Keyword Research

AIsa 有 `SEO Keyword Research` agent skill，用于 keyword strategy、competitor gaps、intent clustering 和 SERP reality checks。这个项目本轮写入的研究语言如下，明确排除简体中文：

| locale | URL 前缀 | DataForSEO / AIsa 地区 | 语言 | 默认种子词 |
| --- | --- | --- | --- | --- |
| `en` | `/` | United States | English | AI makeup try-on; what makeup suits me; virtual makeup tester |
| `de` | `/de/` | Germany | German | KI Make-up Test; welches Make-up passt zu mir; virtuelles Make-up Testen |
| `fr` | `/fr/` | France | French | test maquillage virtuel; quel maquillage pour moi; maquillage naturel |
| `ja` | `/ja/` | Japan | Japanese | AIメイク診断; 似合うメイク; パーソナルカラー診断 |
| `ko` | `/ko/` | South Korea | Korean | AI 메이크업 진단; 나에게 어울리는 메이크업; 퍼스널컬러 진단 |
| `zh-TW` | `/zh-tw/` | Taiwan | Chinese (Traditional) | AI 妝容診斷; 什麼妝適合我; 虛擬試妝 |
| `es` | `/es/` | Spain | Spanish | prueba de maquillaje virtual; qué maquillaje me queda; maquillaje natural |
| `pt-BR` | `/pt-br/` | Brazil | Portuguese | teste de maquiagem virtual; qual maquiagem combina comigo; maquiagem natural |

默认批量语言由 `.dev.vars` 的 `SEO_RESEARCH_LOCALES=en,de,fr,ja,ko,zh-TW,es,pt-BR` 控制。`zh-CN` 不进入本轮 AIsa 多语言关键词研究；如后面要审简体中文，只做本地化质量和站内现有页面审计，不参与这批 Google 推广词定稿。

## 快速 dry-run

```powershell
npm run seo:api:example -- --provider=dataforseo --action=kd --locale=en
npm run seo:api:example -- --provider=aisa --action=kd --locale=en
npm run seo:api:example -- --provider=aisa --action=serp --locale=en --keyword="AI makeup try-on"
npm run seo:api:example -- --provider=aisa --action=kd --all-locales
```

## 真实调用

```powershell
npm run seo:api:example -- --provider=dataforseo --action=kd --locale=en --keywords="AI makeup try-on,what makeup suits me" --execute
npm run seo:api:example -- --provider=dataforseo --action=volume --locale=en --keywords="AI makeup try-on,what makeup suits me" --execute
npm run seo:api:example -- --provider=aisa --action=serp --locale=en --keyword="AI makeup try-on" --execute --output=tmp/aisa-serp-ai-makeup-try-on.json
```

## 跑现有关键词文件

```powershell
npm run seo:api:example -- --provider=dataforseo --action=kd --locale=ja --from-file=keyword-list-all.txt --limit=30
npm run seo:api:example -- --provider=dataforseo --action=kd --locale=ja --from-file=keyword-list-all.txt --limit=30 --execute --output=tmp/dataforseo-ja-kd.json
npm run seo:api:example -- --provider=aisa --action=kd --all-locales --from-file=keyword-list-all.txt --limit=30
```

## 当前示例覆盖的动作

| action | 用途 | DataForSEO direct | AIsa |
| --- | --- | --- | --- |
| `kd` | 批量关键词难度，筛新站可打词 | `/dataforseo_labs/google/bulk_keyword_difficulty/live` | `/dataforseo/dataforseo_labs/google/bulk_keyword_difficulty/live` |
| `volume` | Google Ads 搜索量、CPC、竞争 | `/keywords_data/google_ads/search_volume/live` | `/dataforseo/keywords_data/google_ads/search_volume/live` |
| `serp` | Google Organic SERP 前排证据 | `/serp/google/organic/live/regular` | `/dataforseo/serp/google/organic/live/regular` |
| `site-keywords` | 从域名/页面反查关键词，标准任务会返回 task id | `/keywords_data/google_ads/keywords_for_site/task_post` | `/dataforseo/keywords_data/google_ads/keywords_for_site/task_post` |

## 上线关键词验收口径

1. 先用 `kd` 批量筛：新站优先 KD 0-10，其次 KD 11-25；高 KD 只做内容内覆盖，不先建独立页。
2. 再用 `volume` 看需求：低 KD 但长期无搜索量的词，不单独上页面。
3. 对候选主词跑 `serp`：如果前 10 都是强品牌、视频/商城意图或完全不匹配试妆工具，就降级为辅助词。
4. 最后对已上线 URL 做人工验收：title、H1、首屏回答、正文、FAQ、canonical、hreflang、内链、sitemap 都要匹配同一个搜索意图。

## 参考

- DataForSEO Bulk Keyword Difficulty: https://docs.dataforseo.com/v3/dataforseo_labs/google/bulk_keyword_difficulty/live/
- DataForSEO Google Ads Search Volume: https://docs.dataforseo.com/v3/keywords_data-google_ads-search_volume-live/
- AIsa DataForSEO Labs catalog: https://aisa.one/api/dataforseo-labs
- AIsa Bulk Keyword Difficulty: https://aisa.one/docs/api-reference/dataforseo/post_dataforseo-dataforseo-labs-google-bulk-keyword-difficulty-live
- AIsa Google Organic SERP Regular: https://aisa.one/docs/api-reference/dataforseo/post_dataforseo-serp-google-organic-live-regular
