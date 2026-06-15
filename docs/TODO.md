# Phase 1-4 多语言页面建设进度

> 更新日期：2026-06-14  
> 技术栈：Astro + Cloudflare Workers + Server-side rendering  
> 项目根目录：`C:\antigravity\aibeautystylist`

---

## 已完成

### Phase 1 — 英文 SEO 页面（41 个）

#### L1 产品页（5 个）
| 文件 | URL | 状态 |
|------|-----|------|
| `src/pages/ai-makeup-try-on.astro` | `/ai-makeup-try-on` | 已完成 |
| `src/pages/virtual-makeup-app.astro` | `/virtual-makeup-app` | 已完成 |
| `src/pages/ai-beauty-advisor.astro` | `/ai-beauty-advisor` | 已完成 |
| `src/pages/virtual-makeup-tester.astro` | `/virtual-makeup-tester` | 已完成 |
| `src/pages/personalized-makeup-recommendation.astro` | `/personalized-makeup-recommendation` | 已完成 |

#### L2 风格页（10 个）
| 文件 | URL | 状态 |
|------|-----|------|
| `src/pages/looks/soft-glam.astro` | `/looks/soft-glam` | 已完成 |
| `src/pages/looks/natural-makeup.astro` | `/looks/natural-makeup` | 已完成 |
| `src/pages/looks/no-makeup-makeup.astro` | `/looks/no-makeup-makeup` | 已完成 |
| `src/pages/looks/dewy-skin.astro` | `/looks/dewy-skin` | 已完成 |
| `src/pages/looks/matte-makeup.astro` | `/looks/matte-makeup` | 已完成 |
| `src/pages/looks/date-night.astro` | `/looks/date-night` | 已完成 |
| `src/pages/looks/minimalist.astro` | `/looks/minimalist` | 已完成 |
| `src/pages/looks/glass-skin.astro` | `/looks/glass-skin` | 已完成 |
| `src/pages/looks/clean-girl.astro` | `/looks/clean-girl` | 已完成 |
| `src/pages/looks/glowy.astro` | `/looks/glowy` | 已完成 |

#### L3 场景页（10 个）
| 文件 | URL | 状态 |
|------|-----|------|
| `src/pages/scenarios/interview.astro` | `/scenarios/interview` | 已完成 |
| `src/pages/scenarios/office.astro` | `/scenarios/office` | 已完成 |
| `src/pages/scenarios/first-date.astro` | `/scenarios/first-date` | 已完成 |
| `src/pages/scenarios/passport-photo.astro` | `/scenarios/passport-photo` | 已完成 |
| `src/pages/scenarios/wedding-guest.astro` | `/scenarios/wedding-guest` | 已完成 |
| `src/pages/scenarios/prom.astro` | `/scenarios/prom` | 已完成 |
| `src/pages/scenarios/graduation.astro` | `/scenarios/graduation` | 已完成 |
| `src/pages/scenarios/vacation.astro` | `/scenarios/vacation` | 已完成 |
| `src/pages/scenarios/quick-5min.astro` | `/scenarios/quick-5min` | 已完成 |
| `src/pages/scenarios/nighttime.astro` | `/scenarios/nighttime` | 已完成 |

#### L4 人群/特征页（8 个）
| 文件 | URL | 状态 |
|------|-----|------|
| `src/pages/for/hooded-eyes.astro` | `/for/hooded-eyes` | 已完成 |
| `src/pages/for/round-face.astro` | `/for/round-face` | 已完成 |
| `src/pages/for/mature-skin.astro` | `/for/mature-skin` | 已完成 |
| `src/pages/for/dark-skin.astro` | `/for/dark-skin` | 已完成 |
| `src/pages/for/olive-skin.astro` | `/for/olive-skin` | 已完成 |
| `src/pages/for/fair-skin.astro` | `/for/fair-skin` | 已完成 |
| `src/pages/for/single-eyelids.astro` | `/for/single-eyelids` | 已完成 |
| `src/pages/for/face-shape-contour.astro` | `/for/face-shape-contour` | 已完成 |

#### L5 教程/产品页（8 个）
| 文件 | URL | 状态 |
|------|-----|------|
| `src/pages/guides/beginner-tutorial.astro` | `/guides/beginner-tutorial` | 已完成 |
| `src/pages/guides/apply-step-by-step.astro` | `/guides/apply-step-by-step` | 已完成 |
| `src/pages/guides/beginner-routine.astro` | `/guides/beginner-routine` | 已完成 |
| `src/pages/guides/easy-everyday.astro` | `/guides/easy-everyday` | 已完成 |
| `src/pages/guides/natural-makeup-how.astro` | `/guides/natural-makeup-how` | 已完成 |
| `src/pages/guides/makeup-essentials.astro` | `/guides/makeup-essentials` | 已完成 |
| `src/pages/guides/mistakes-avoid.astro` | `/guides/mistakes-avoid` | 已完成 |
| `src/pages/guides/drugstore-beginners.astro` | `/guides/drugstore-beginners` | 已完成 |

### Phase 2 — 德语/法语/日语（81 个页面）

实现方式：`src/i18n/localizedSeoPages.ts` 统一存放页面数据，`src/pages/[locale]/index.astro` 和 `src/pages/[locale]/[...slug].astro` 动态渲染本地化 SEO 页面。已接入 sitemap、hreflang、self-canonical、语言切换器和索引审计。

| 语言 | 页面数 | URL 前缀 | 状态 |
|------|:------:|----------|------|
| 德语 | 18 | `/de/` | 已完成 |
| 法语 | 27 | `/fr/` | 已完成 |
| 日语 | 36 | `/ja/` | 已完成 |

### Phase 3 — 韩语/繁体中文（53 个页面）

实现方式：`src/i18n/localizedSeoPagesPhase3.ts` 存放韩语/繁体中文页面数据，并复用 `src/pages/[locale]/index.astro` 和 `src/pages/[locale]/[...slug].astro` 动态渲染。本批已接入 sitemap、hreflang、self-canonical、语言切换器、运行时基础字典和妆容目录本地化。

| 语言 | 页面数 | URL 前缀 | 状态 |
|------|:------:|----------|------|
| 韩语 | 29 | `/ko/` | 已完成 |
| 繁体中文 | 24 | `/zh-tw/` | 已完成 |

### Phase 4 — 西语/葡语（45 个页面）

实现方式：`src/i18n/localizedSeoPagesPhase4.ts` 存放西语/巴葡页面数据，并复用动态本地化 SEO 页面渲染。本批已接入 sitemap、hreflang、self-canonical、语言切换器、运行时基础字典和妆容目录本地化。

| 语言 | 页面数 | URL 前缀 | 状态 |
|------|:------:|----------|------|
| 西语 | 20 | `/es/` | 已完成 |
| 葡语-巴西 | 25 | `/pt-br/` | 已完成 |

### 基础设施
| 组件 | 文件 | 状态 |
|------|------|------|
| SEO 落地页布局组件 | `src/components/SeoLandingLayout.astro` | 已创建 |
| Sitemap | `src/pages/sitemap.xml.ts`, `src/pages/sitemap-en.xml.ts`, `src/pages/sitemap-de.xml.ts`, `src/pages/sitemap-fr.xml.ts`, `src/pages/sitemap-ja.xml.ts`, `src/pages/sitemap-ko.xml.ts`, `src/pages/sitemap-zh-tw.xml.ts`, `src/pages/sitemap-es.xml.ts`, `src/pages/sitemap-pt-br.xml.ts`, `src/i18n/sitemap.ts` | 已拆分为 sitemap index + 分语言 sitemap；Phase 2/3/4 页面已进入 sitemap |
| 多语言 URL 路由 | `astro.config.mjs`, `src/middleware.ts`, `src/i18n/config.ts`, `src/i18n/routing.ts` | 已完成；英文保留根路径，其他语言使用前缀并内部 rewrite 到现有页面 |
| hreflang/canonical | `src/i18n/hreflang.ts`, `src/layouts/BaseLayout.astro` | 已完成；Phase 2/3/4 页面 self-canonical，并按语义相近页面互指 hreflang |
| 语言切换器 | `src/components/SiteHeader.astro` | 已完成；切换语言时写入 `abs_locale` cookie 并保留当前页面上下文 |
| 索引审计 | `scripts/audit-indexing.mjs`, `package.json` | 已新增 `npm run audit:indexing` |
| 构建检查 | `npm run check`, `npx astro build --dry-run`, `npm test`, `npm run audit:indexing` | **0 errors, 0 warnings；18 test files / 86 tests passed；索引审计 242 URLs / 0 issues** |

### 关键词调研数据
| 文件 | 内容 |
|------|------|
| `MULTILINGUAL_SEO_KEYWORDS.md` | 8 种语言 609 个关键词（含搜索意图分类） |
| `keyword-kd-results.csv` | 609 个关键词的 KD 查询结果（DataForSEO 评分） |
| `keyword-list-all.txt` | 纯关键词列表（语言 + 分类 + 关键词） |
| `docs/MULTILINGUAL_PAGE_STRUCTURE.md` | 完整的多语言页面架构方案（含每页 KD、URL、分类） |
| `scripts/batch-kd-checker.cjs` | 批量 KD 查询脚本 |

### 页面模板规范（已完成页面统一遵循）

每个 SEO 页面都使用 `SeoLandingLayout` 组件，结构统一为：
- `slot="hero"` — H1 + 副标题
- 正文内容（`<div class="seo-content">`）— 500+ 字独特内容
- `slot="cta"` — CTA 区域（链接到 `/tryon-free`）
- `slot="related"` — 内部链接区块
- FAQ 自动输出为 FAQPage JSON-LD

**关键规则**：每个页面必须有独特内容，不做模板复制。每页包含至少 2 种信息增益（步骤列表、对比表、特征网格、高亮框等）。

---

## 未完成

### 基础设施待完成

#### 多语言页面内容接入
- 后续新增语言继续在 `src/i18n/localizedSeoPages.ts` 或拆分文件中登记页面数据
- 对应语言完成后，在 `src/i18n/config.ts` 中开启 `includeInSitemap`
- 新语言页面需要独特 title、H1、首屏文案、正文、FAQ 和 CTA，不能只依赖 fallback rewrite

#### 每页必须满足的准入条件
- [ ] 有独特 title（非英文翻译，符合当地搜索表达）
- [ ] 有独特 H1
- [ ] 有独特首屏文案
- [ ] 有至少 1 个内部入口链接
- [ ] self-canonical 正确
- [ ] 有结构化数据（FAQPage / HowTo / Article 等）
- [ ] 有 300+ 字独特正文内容
- [ ] 有 CTA 导向试妆转化

### 质量检查

#### Google 爬虫风险防控
- 每批上线后观察 2-4 周 GSC 索引率
- 如果 >30% 的页面未被索引（`Crawled - currently not indexed`），暂停并优化
- 禁止批量生成模板页——每个页面必须有独特内容
- KD 无数据的 322 个长尾词不做独立页，作为页面内区块

#### 索引审计
- 已新增 `npm run audit:indexing`，用于检查：
  - sitemap URL 是否全部可索引
  - noindex/sitemap 冲突
  - canonical 精确匹配
  - H1 数量
  - JSON-LD 可解析性
  - 重复 title/description
  - 低内部链接页面
- 当前本地 dev server 审计结果：242 URLs，0 errors，0 warnings

---

## 快速上手指南

### 创建新 SEO 页面的模板

```astro
---
import SeoLandingLayout from "../../components/SeoLandingLayout.astro";

const page = {
  title: "页面标题",
  description: "SEO meta description",
  faq: [
    { q: "问题 1", a: "回答 1" },
    { q: "问题 2", a: "回答 2" },
    { q: "问题 3", a: "回答 3" },
    { q: "问题 4", a: "回答 4" },
  ],
  relatedLinks: [
    { label: "相关页面 1", url: "/相关路径" },
    { label: "相关页面 2", url: "/相关路径" },
  ],
};
---

<SeoLandingLayout {...page}>
  <div slot="hero">
    <h1>页面 H1 标题</h1>
    <p>副标题/价值主张</p>
  </div>

  <div class="seo-content">
    <h2>内容章节</h2>
    <p>正文内容...</p>
    <!-- 可使用 .step-list, .feature-grid, .compare-table, .highlight-box 等样式 -->
  </div>

  <div class="seo-cta" slot="cta">
    <div class="seo-cta-inner">
      <h2>CTA 标题</h2>
      <p>CTA 描述</p>
      <a href="/tryon-free" class="cta-btn">CTA 按钮文字</a>
    </div>
  </div>

  <div class="seo-related" slot="related">
    <div class="related-inner">
      <h3>Explore More</h3>
      <ul class="related-list">
        {page.relatedLinks.map((link) => (
          <li><a href={link.url}>{link.label}</a></li>
        ))}
      </ul>
    </div>
  </div>
</SeoLandingLayout>
```

### 关键注意事项

1. **JS 字符串内不要用 `"`（ASCII 双引号）**，改用 `'`（单引号），否则会破坏 TS 解析
2. **所有 SEO 页面统一使用 `SeoLandingLayout`**，不要自行引入其他布局
3. **FAQ 必须独特**——不同页面的 FAQ 不要重复
4. **正文内容必须独特**——不能只是替换关键词
5. **CTA 文字要与页面主题相关**（如风格页用 "Try This Style on Your Face — Free"）

### 验证命令

```bash
# 类型检查
npx astro check

# 构建测试
npx astro build --dry-run

# 索引审计（需本地 dev server 或设置 AUDIT_BASE_URL）
npm run audit:indexing

# 检查页面数量
ls -1 src/pages/looks/*.astro src/pages/scenarios/*.astro src/pages/for/*.astro src/pages/guides/*.astro | wc -l
```
