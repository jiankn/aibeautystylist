# AI Beauty Stylist 全球妆容区域化改造规划

> 文档状态：提案  
> 编写日期：2026-06-13  
> 适用范围：全站内容、妆容目录、参考图、推荐系统、AI 诊断、AI 试妆、账户偏好、国际化与运营流程

## 1. 执行摘要

项目需要从当前的“同一套妆容目录翻译成不同语言”，升级为“根据用户所处市场、审美偏好和个人特征，提供不同妆容方向与参考人物”的全球化美妆产品。

但不能直接采用以下规则：

```text
中文 = 东亚人
英文 = 白人
葡萄牙语 = 拉丁裔
```

语言只能作为匿名用户首次访问时的默认推荐信号，不能被当成人种判断。原因包括：

- 英语用户来自美国、英国、印度、非洲、东南亚等多个市场。
- 巴西葡萄牙语用户本身具有高度多元的肤色与面部特征。
- 用户使用某种语言，不代表用户本人属于该语言常见地区的人群。
- 将语言直接绑定人种会制造刻板印象，并降低跨文化用户的信任。
- 当前 AI 诊断明确禁止从自拍推断 ethnicity，后续架构必须继续保持这一边界。

正确方案是建立独立的 **Audience Context 用户内容上下文层**：

```text
界面语言 Locale
    +
默认内容市场 Market Profile
    +
用户主动选择的审美灵感 Beauty Preference
    +
用户主动选择的模特呈现偏好 Representation Preference
    +
自拍诊断得到的非敏感妆容适配信息 Beauty Context
    =
最终展示、排序与生成的妆容内容
```

核心产品原则：

1. **语言决定默认起点，不决定用户身份。**
2. **市场画像决定内容排序，不应成为不可突破的内容墙。**
3. **模特呈现默认多元，用户可以主动选择更相关的参考。**
4. **妆容配方与模特图片分离，同一妆容可在不同人物上呈现。**
5. **不从自拍推断人种，诊断只使用肤色深浅、冷暖、五官位置与用户偏好。**
6. **先小规模验证推荐价值，再批量生成全部区域资产。**

---

## 2. 当前项目审计结论

### 2.1 当前已有能力

- `src/lib/i18n.ts` 已有 `zh-CN` 与 `en` 两种语言上下文。
- `src/middleware.ts` 已支持 Cookie 和 `Accept-Language` 决定语言。
- `migrations/0001_initial.sql` 已存在 `locale_preferences` 表，但当前没有实际业务使用。
- `src/data/blogData.ts` 已采用中英文分内容库，可以作为内容本地化的参考模式。
- `src/lib/diagnosis.ts` 已包含肤色深浅、冷暖、眼型、色彩季型等非人种维度。
- `src/lib/geminiDiagnosis.ts` 已明确禁止识别人种、年龄和其他敏感属性。
- 登录页已经根据语言组切换不同人物图片，可作为最小验证样例。

### 2.2 当前主要问题

#### 单一妆容目录

`src/data/lookCatalog.ts` 当前将以下内容绑定在一个对象内：

- 稳定 slug
- 中文标题
- 中文场景与妆效标签
- 中文顾问建议
- 单张参考人物图片
- AI 生成提示词所使用的妆容意图

这意味着一张图片、一套中文说明和一个妆容定义被视为同一事物，无法针对不同市场复用或变化。

#### `/discover` 没有区域化入口

`src/pages/discover.astro` 直接渲染完整 `lookCatalog`，筛选条件也全部为中文硬编码。当前没有：

- 市场画像
- 区域灵感筛选
- 用户内容偏好
- 模特呈现偏好
- 多语言妆容元数据
- 区域化排序

#### 全站大量页面直接依赖 `lookCatalog`

当前直接使用 `lookCatalog` 的关键模块包括：

- 首页 `src/pages/index.astro`
- 妆容库 `src/pages/discover.astro`
- 免费、Pro、Premium 试妆页
- 诊断页推荐
- `LookCard`、`LookSelector`
- `/api/looks`
- 试妆任务创建与重试 API
- 任务结果、历史记录与参考图回退

因此，直接复制多份 `lookCatalog` 会造成数据分叉和长期维护风险。

#### 首页与诊断示例图硬编码

首页 Hero、工作流演示、AI 能力图和诊断示例图均使用固定人物资源。即使 `/discover` 区域化，首页与诊断仍会呈现冲突画像。

#### API 与历史记录缺少版本上下文

试妆任务当前主要保存：

- `lookSlug`
- `lookTitle`
- 结果图

没有保存：

- 妆容配方版本
- 市场变体 ID
- 本地化语言
- 参考资产版本
- 用户内容画像

未来更新目录后，历史记录可能无法准确还原用户当时选择的妆容。

---

## 3. 产品定位：从“按人种分站”改为“按市场与偏好推荐”

### 3.1 建议使用的四层概念

| 概念 | 示例 | 用途 | 是否允许自动判断 |
|---|---|---|---|
| `locale` 界面语言 | `zh-CN`、`en-US`、`pt-BR` | 文案、格式、SEO | 可以根据浏览器默认 |
| `marketProfile` 内容市场 | `east-asia`、`latin-america`、`global-english` | 默认内容排序与趋势方向 | 可以根据 locale/region 默认 |
| `beautyPreference` 审美偏好 | 清透、柔雾、轮廓、编辑感、暖金 | 个性化排序和生成 | 用户主动选择或行为学习 |
| `representationPreference` 模特呈现偏好 | 多元展示、东亚模特、深肤色模特等 | 选择参考图，不改变妆容资格 | 只允许用户主动选择 |

`skinTone.depth`、`undertone`、`eyeShape` 等诊断信息属于 **Beauty Context**，用于判断妆容配色和位置是否适合，不用于推断用户属于哪个族群。

### 3.2 默认推荐逻辑

优先级从高到低：

1. 用户账户中明确保存的内容偏好。
2. 当前会话中用户主动选择的“妆容灵感地区”或“模特展示偏好”。
3. 带地区的 BCP 47 locale，例如 `pt-BR`、`es-419`、`en-US`。
4. 仅语言 locale，例如 `en`、`es`。
5. 安全的 `global-diverse` 多元默认画像。

用户随时可以进入“全部妆容”或切换其他灵感地区，不能被默认画像锁住。

### 3.3 首次访问的建议体验

匿名用户不增加强制 onboarding。系统根据语言给出默认内容，并在妆容库顶部提供一个轻量入口：

```text
正在优先展示：东亚灵感
[切换灵感]
```

点击后打开简洁选择器：

- 东亚灵感
- 全球多元
- 拉丁美洲灵感
- 欧洲编辑感
- 混合推荐

对于已登录用户，在完成首次诊断或首次收藏后，再引导保存偏好：

```text
以后优先推荐类似风格？
[保存偏好] [保持混合推荐]
```

### 3.4 模特呈现偏好

不建议在主导航直接使用“选择人种”文案。更自然的产品文案：

```text
参考模特展示
- 多元展示
- 优先展示与我关注方向接近的模特
- 东亚面孔
- 黑人模特
- 拉丁裔模特
- 南亚面孔
- 中东面孔
- 白人模特
```

关键规则：

- 默认选择“多元展示”。
- 选择结果仅改变参考图与排序，不限制用户可以尝试的妆容。
- 不通过自拍自动设置此字段。
- 允许用户不回答。

---

## 4. 市场画像规划

市场画像不是美妆规则，也不是对某一地区用户的固定定义。它只是用于组织首批内容和排序的运营层，必须由当地妆容专家和真实用户持续校正。

### 4.1 第一阶段市场画像

| Market Profile | 建议 locale | 默认内容策略 | 模特展示策略 |
|---|---|---|---|
| `east-asia` | `zh-CN`、未来 `ja-JP`、`ko-KR`、`zh-TW`、`zh-HK` | 优先清透底妆、柔雾、低饱和、单眼皮或内双可见区、日常通勤和本地活动场景 | 东亚模特为主，同时保留肤色深浅与五官差异 |
| `global-english` | 无明确地区的 `en` | 多元风格混排，不默认白人优先 | 白人、黑人、拉丁裔、南亚、中东、东亚与混合背景模特均衡轮换 |
| `north-america` | `en-US`、`en-CA` | 日常、Clean、Soft Glam、Camera-ready、活动妆并重 | 多元展示，覆盖不同肤色深浅 |
| `latin-america` | `pt-BR`、`es-419`、后续具体国家 | 暖调、轮廓、光泽、活动与高温高湿持妆方向，同时保留自然日常 | 深浅肤色和多元面孔均衡，不将拉美等同单一外貌 |
| `western-europe` | `de-DE`、`fr-FR`、`es-ES`、`pt-PT`、`en-GB` | 自然、精致、法式松弛、编辑感、通勤和晚宴 | 欧洲多元人群，不只展示白人 |

### 4.2 后续市场画像

- `south-asia`
- `middle-east-north-africa`
- `southeast-asia`
- `africa`
- `oceania`

在没有本地专家与用户测试前，不应仅凭生成模型批量上线这些画像。

### 4.3 locale 与 marketProfile 的初始映射

建议使用完整 BCP 47 locale，而不是只有语言代码。

```ts
const localeMarketDefaults = {
  "zh-CN": "east-asia",
  "zh-TW": "east-asia",
  "zh-HK": "east-asia",
  "ja-JP": "east-asia",
  "ko-KR": "east-asia",
  "pt-BR": "latin-america",
  "es-419": "latin-america",
  "pt-PT": "western-europe",
  "es-ES": "western-europe",
  "de-DE": "western-europe",
  "fr-FR": "western-europe",
  "en-US": "north-america",
  "en-CA": "north-america",
  "en-GB": "western-europe",
  en: "global-english",
} as const;
```

当无法确定地区时，必须回退到 `global-english` 或 `global-diverse`，不能回退到“白人默认”。

---

## 5. 妆容内容架构

### 5.1 必须拆分“妆容配方”和“人物参考图”

一个妆容不应该由某张人物图片定义。建议拆成五层：

```text
Look Recipe
  妆容本身的配色、位置、妆感、覆盖度和操作难度

Look Market Variant
  针对某市场的场景命名、趋势表达、推荐权重与局部调整

Look Localization
  标题、说明、筛选标签、顾问建议和 SEO 文案

Look Asset Variant
  同一妆容在不同模特、肤色深浅、主题和画幅中的参考图

Look Ranking Metadata
  市场权重、个性化标签、质量分、发布时间与实验分组
```

### 5.2 推荐的数据类型

```ts
type MarketProfile =
  | "east-asia"
  | "global-english"
  | "north-america"
  | "latin-america"
  | "western-europe"
  | "global-diverse";

type RepresentationGroup =
  | "east-asian"
  | "black"
  | "latina"
  | "south-asian"
  | "middle-eastern"
  | "white"
  | "mixed"
  | "diverse-unspecified";

interface LookRecipe {
  id: string;
  version: string;
  status: "draft" | "review" | "active" | "retired";
  palette: string[];
  placement: {
    base: string[];
    eyes: string[];
    brows: string[];
    cheeks: string[];
    lips: string[];
    contour: string[];
  };
  finish: string[];
  contrast: "low" | "medium" | "high";
  coverage: "sheer" | "medium" | "full";
  skillLevel: "beginner" | "intermediate" | "advanced";
  compatibleContexts: string[];
  cautions: string[];
}

interface LookMarketVariant {
  id: string;
  recipeId: string;
  marketProfiles: MarketProfile[];
  rankingWeight: number;
  scenarioTags: string[];
  trendTags: string[];
  promptAdditions: string[];
  activeFrom?: string;
  activeTo?: string;
}

interface LookLocalization {
  marketVariantId: string;
  locale: string;
  title: string;
  summary: string;
  imageAltTemplate: string;
  advisor: {
    fit: string;
    effect: string;
    anchors: string[];
    caution: string;
    judge: string[];
  };
}

interface LookAssetVariant {
  id: string;
  marketVariantId: string;
  image: string;
  representationGroup: RepresentationGroup;
  skinToneBand: string;
  undertone?: string;
  theme: "light" | "dark" | "neutral";
  aspectRatio: "3:4" | "4:3" | "1:1" | "16:9";
  focalPosition: string;
  qualityStatus: "draft" | "approved" | "rejected";
  promptVersion: string;
}
```

### 5.3 推荐的静态文件结构

第一阶段仍可使用 TypeScript 静态数据，不需要立即建设 CMS。

```text
src/data/makeup/
  recipes.ts
  marketVariants.ts
  localizations/
    zh-CN.ts
    en.ts
    pt-BR.ts
    es-419.ts
    de-DE.ts
  assets.ts
  audienceProfiles.ts
  resolveCatalog.ts
  ranking.ts
```

图片文件建议：

```text
public/images/looks/
  <recipe-id>/
    <market-variant-id>/
      <asset-id>-3x4.webp
      <asset-id>-4x3.webp
```

不要继续使用只有 `look-commute.webp` 这类无法表达变体的扁平路径。

### 5.4 保持稳定 ID

建议区分：

- `recipeId`：妆容配方的长期稳定 ID。
- `marketVariantId`：该妆容在某市场的运营变体。
- `assetId`：具体参考图片。
- `locale`：用户当时看到的文案版本。
- `recipeVersion`：生成任务使用的配方版本。

试妆任务应保存这些字段，历史记录才可还原。

---

## 6. 推荐与排序系统

### 6.1 不采用硬过滤

除非内容确实只适用于特定活动或产品可用性，不应因市场画像而隐藏其他妆容。

`/discover` 建议分为：

1. **为你推荐**：根据当前 Audience Context 排序。
2. **本地灵感**：当前 marketProfile 的高权重内容。
3. **全球热门**：跨市场高质量内容。
4. **按场景浏览**：不受地区限制。
5. **全部妆容**：完整可搜索目录。

### 6.2 初始排序公式

第一阶段不需要机器学习，可以使用可解释加权：

```text
score =
  市场匹配度 * 0.30
  + 用户审美偏好 * 0.24
  + 诊断适配度 * 0.20
  + 场景匹配度 * 0.12
  + 内容质量分 * 0.08
  + 多元轮换分 * 0.04
  + 新鲜度 * 0.02
```

必须保留 `diversity rotation`，避免用户长期只看到同一种面孔、肤色和妆感。

### 6.3 Audience Context 解析器

新增统一入口，禁止各页面自行写 `isEnglish ? A : B`：

```ts
interface AudienceContext {
  locale: string;
  marketProfile: MarketProfile;
  beautyPreferences: string[];
  representationPreference: RepresentationGroup[] | ["diverse"];
  source: "account" | "session" | "locale" | "fallback";
}

resolveAudienceContext(request, cookies, userPreferences): AudienceContext
resolveLookCatalog(audienceContext, diagnosisContext?): ResolvedLook[]
resolvePageAssets(pageId, audienceContext): ResolvedPageAssets
```

所有页面、API 和生成任务必须通过该层获取妆容与图片。

---

## 7. 全站页面改造范围

### 7.1 首页 `/`

需要区域化的内容：

- Hero 前后对比人物图
- 场景推荐卡
- 工作流示例妆容
- AI 能力说明人物图
- 决策案例
- 图片 alt 与相关文案

首页不应仅换 Hero，首屏以下的案例也必须与默认画像一致，否则用户会感到推荐逻辑不可信。

### 7.2 妆容库 `/discover`

核心改造：

- 从 `resolveLookCatalog()` 获取目录。
- 增加“正在优先展示”的市场画像提示。
- 增加“灵感地区”筛选，但不把它设计成人种筛选。
- 增加“模特展示”偏好入口。
- 所有筛选标签本地化。
- 同一妆容卡可根据用户偏好选择不同参考图。
- 增加“全部妆容”明确出口。
- 空状态与数量文案本地化。

验收重点：

- 中文默认首屏以东亚灵感和东亚模特为主。
- 英文无地区信息时默认展示多元模特，而非全部白人。
- `pt-BR` 默认优先拉美市场内容，且展示多元肤色。
- 用户切换画像后，刷新页面仍保持选择。

### 7.3 试妆工作台

涉及：

- `/tryon-free`
- `/tryon-pro`
- `/tryon-premium`
- `LookSelector`
- `LookCard`

改造要求：

- 推荐妆容来自当前 Audience Context。
- 外部传入的 `look` 必须解析到稳定 `recipeId` 或 `marketVariantId`。
- 顾问建议使用当前 locale 文案。
- 参考图回退使用用户当时选择的 `assetId`，不能重新按当前语言随机选择。
- 用户可以跨市场试妆，不能因为地区不匹配而返回 404。

### 7.4 AI 妆容诊断 `/diagnosis`

改造要求：

- 示例人物图与当前 Audience Context 对应。
- 默认推荐妆容来自区域化目录。
- 诊断提示词继续禁止推断 ethnicity。
- 诊断结果加入用户主动选择的审美偏好，但不加入系统猜测的人种。
- 推荐结果应平衡“个人适配”与“用户审美偏好”，不能只按市场流行趋势推荐。

### 7.5 登录页 `/login`

当前两组人物逻辑可保留为试点，但后续应接入统一 `resolvePageAssets("login", context)`：

- 中文、日语、韩语默认东亚人物。
- 英文默认全球多元轮换，不长期固定白人。
- 葡萄牙语和西班牙语需区分地区。
- Light/Dark 资产必须成对管理。

### 7.6 博客与 SEO

博客不仅需要翻译，还需决定：

- 是否适合目标市场。
- 示例照片是否与文章读者相关。
- 产品、场景和气候说明是否需要本地化。
- 内链是否连接到当前市场可见的妆容。

未来 URL 建议采用明确 locale 路径或完善 `hreflang`，但应单独立项，不与首轮参考图改造同时上线。

### 7.7 账户、历史记录与分享

- 账户页增加“妆容灵感偏好”和“参考模特展示”设置。
- 历史记录保留任务创建时的 locale、marketProfile、variantId 和 recipeVersion。
- 分享卡展示用户实际生成结果，不根据查看者 locale 替换结果图。
- 保存的妆容在跨语言切换后显示当前语言标题，但保留原始稳定 ID。

### 7.8 当前仓库的文件级改造触点

| 当前文件 | 主要问题 | 目标改造 |
|---|---|---|
| `src/lib/i18n.ts` | 只支持 `zh-CN` 与 `en`，语言和地区信息不足 | 支持完整 BCP 47 locale，并与 marketProfile 解耦 |
| `src/middleware.ts` | 只注入 locale | 同时解析 Audience Context，账户偏好优先于 Cookie 与浏览器语言 |
| `src/data/lookCatalog.ts` | 配方、中文文案和单张图片耦合 | 拆为 recipe、market variant、localization、asset |
| `src/data/lookCatalog.test.ts` | 只验证 44 张唯一图片和中文元数据 | 验证变体完整性、资产覆盖、本地化与 fallback |
| `src/pages/index.astro` | 首页人物和妆容案例硬编码 | 通过 `resolvePageAssets()` 与 `resolveLookCatalog()` 解析 |
| `src/pages/discover.astro` | 直接渲染单一目录，筛选硬编码中文 | 接入 Audience Context、区域灵感、本地化筛选与排序 |
| `src/components/LookCard.astro` | 中文固定标签与顾问文案 | 接收已解析的本地化妆容对象 |
| `src/components/LookSelector.astro` | 依赖单一 LookCatalogItem | 使用稳定 recipe/variant/asset 标识 |
| `src/pages/tryon-*.astro` | 推荐列表直接查询旧目录 | 使用统一 resolver，并保留外部选择兼容 |
| `src/pages/diagnosis.astro` | 示例图与默认推荐硬编码 | 使用区域化示例图和个性化推荐 |
| `src/pages/login.astro` | 已有语言分组，但逻辑独立 | 接入统一页面资产解析器 |
| `src/pages/api/looks.ts` | 返回全部旧目录 | 返回解析后的区域化目录与上下文 |
| `src/pages/api/tryon-jobs/index.ts` | 只按旧 slug 查找妆容 | 解析 recipeId/variantId，保存上下文快照 |
| `src/pages/api/tryon-jobs/[id]/retry.ts` | 重试可能使用目录当前状态 | 优先使用原任务的配方版本和市场变体 |
| `src/lib/tryonJobService.ts` | 提示词依赖中文标题、intent 和 finish | 使用结构化配方、本地化和用户偏好 |
| `src/lib/jobs.ts` | 结果缺少版本和区域上下文 | 保存 recipeVersion、variantId、assetId、locale |
| `src/lib/geminiDiagnosis.ts` | 安全边界正确，但没有用户审美上下文 | 仅加入用户主动偏好，继续禁止敏感属性推断 |
| `migrations/0001_initial.sql` | 有未使用的 locale_preferences | 新增独立内容偏好表和任务快照字段 |
| `public/images/` | 资源路径扁平，无法表达变体 | 使用 recipe/variant/asset 分层目录 |

---

## 8. AI 图片与参考资产生产计划

### 8.1 不建议一次性重新生成全部图片

当前有 44 个活跃妆容。如果直接为每个妆容生成：

```text
44 个妆容
× 5 个市场
× 6 类模特呈现
× 2 个主题
= 2640 张图片
```

这会带来高昂生成、审核、压缩、维护和视觉一致性成本，也无法证明用户真的需要这些组合。

### 8.2 推荐的分层资产策略

#### Tier A：高曝光资产

首页 Hero、登录、诊断示例、OG 图。

- 每个重点 marketProfile 生成专属资产。
- Light/Dark 成对管理。
- 必须人工逐张验收。

#### Tier B：核心妆容卡

高频场景与高转化妆容。

- 每个重点市场 8 至 12 个核心妆容。
- 每个妆容先生成 2 至 3 个模特变体。
- 根据点击和试妆数据决定是否扩充。

#### Tier C：长尾妆容

- 初期复用高质量通用参考图。
- 当该妆容在特定市场获得流量后，再补当地变体。

### 8.3 首轮图片生产规模

建议 Pilot：

```text
8 个核心妆容配方
× 2 个首发市场画像：east-asia、global-english
× 3 个代表性模特变体
= 48 张核心妆容参考图

再增加约 8 至 12 张首页、登录与诊断高曝光资产
```

首轮总量控制在 60 张左右，足以验证用户是否更愿意点击和试妆。

第二轮再加入：

- `latin-america`
- `western-europe`
- 更多肤色深浅与五官呈现

### 8.4 妆容图片生成规范

每张图必须具备结构化生成单：

```text
recipeId
marketVariantId
representationGroup
skinToneBand
undertone
face/eye presentation notes
makeup placement specification
palette specification
finish specification
lighting
camera/crop
negative constraints
promptVersion
reviewer
review status
```

统一负面约束：

- 不改变模特身份和基础五官。
- 不自动美白肤色。
- 不磨皮到丢失真实纹理。
- 不用夸张瘦脸或整形效果代替妆容效果。
- 不把某一市场固定成单一肤色。
- 不添加产品包装、品牌文字或水印。
- 不生成不符合妆容配方的随机华丽效果。

### 8.5 图片质量验收

每张图片必须通过四类审核：

#### 妆容专业审核

- 配色是否符合配方。
- 眼影、眼线、腮红、修容和唇部位置是否可实现。
- 妆效是否符合目标场景。
- 是否错误处理单眼皮、内双、深肤色显色等细节。

#### 表现公平性审核

- 是否出现肤色被自动提亮或灰化。
- 深肤色高光、腮红和唇色是否真实显色。
- 是否把不同群体生成成高度相似的单一脸型。
- 是否存在区域刻板印象或夸张符号化。

#### 视觉与 UI 审核

- 裁切后人物与妆容重点仍清楚。
- 图片在 Light/Dark UI 中均可读。
- 卡片文字不会遮挡关键五官。
- 3:4、4:3、1:1 等画幅有稳定焦点。

#### 技术审核

- WebP/AVIF 压缩质量合格。
- 有明确尺寸和焦点位置。
- 无重复图片与错误路径。
- 图片加载不会造成 CLS。
- alt 文案与实际图片一致。

---

## 9. AI 诊断与试妆生成链路改造

### 9.1 诊断原则

保持当前 `geminiDiagnosis.ts` 的安全边界：

```text
Do not identify the person, infer health, ethnicity, age, or other sensitive traits.
```

新增输入只允许包括：

- 用户明确选择的妆容灵感地区。
- 用户明确选择的妆感偏好。
- 用户明确选择的场景。
- 当前 locale。

不得将 `marketProfile` 描述成用户本人身份。

### 9.2 试妆图片提示词

当前 `makeupImagePrompt()` 使用 `look.title`、`look.intent` 与 `finish`。改造后应使用结构化配方：

```text
Selected makeup recipe
Placement instructions
Palette direction
Coverage and contrast
Market styling context
User-selected style preference
Diagnosis context
Identity and skin texture preservation constraints
```

示例逻辑：

```ts
makeupImagePrompt({
  recipe,
  marketVariant,
  localization,
  diagnosis,
  userPreferences,
});
```

市场变体只能影响妆容风格与场景表达，不能要求模型改变用户本人面部族群特征。

### 9.3 任务记录升级

建议试妆任务结果增加：

```ts
interface TryOnJobResult {
  lookRecipeId: string;
  lookRecipeVersion: string;
  marketVariantId: string;
  referenceAssetId?: string;
  locale: string;
  marketProfile: MarketProfile;
  lookTitleSnapshot: string;
}
```

历史任务必须继续展示当时的结果，不能因目录更新而变化。

---

## 10. 数据库与 API 改造

### 10.1 用户偏好表

建议新增 `user_content_preferences`，不要继续把所有内容塞入 `locale_preferences`：

```sql
CREATE TABLE user_content_preferences (
  user_id TEXT PRIMARY KEY,
  locale TEXT NOT NULL,
  market_profile TEXT NOT NULL,
  beauty_preferences_json TEXT NOT NULL DEFAULT '[]',
  representation_preferences_json TEXT NOT NULL DEFAULT '["diverse"]',
  source TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

匿名用户使用 Cookie：

```text
abs_locale
abs_market_profile
abs_beauty_preferences
abs_representation_preferences
```

### 10.2 任务表迁移

建议给 `tryon_jobs` 增加可查询列：

```sql
ALTER TABLE tryon_jobs ADD COLUMN look_recipe_id TEXT;
ALTER TABLE tryon_jobs ADD COLUMN look_recipe_version TEXT;
ALTER TABLE tryon_jobs ADD COLUMN market_variant_id TEXT;
ALTER TABLE tryon_jobs ADD COLUMN reference_asset_id TEXT;
ALTER TABLE tryon_jobs ADD COLUMN locale TEXT;
ALTER TABLE tryon_jobs ADD COLUMN market_profile TEXT;
```

同时继续在 `result_json` 中保留完整快照。

### 10.3 `/api/looks`

当前 API 返回全部单一目录。建议升级：

```text
GET /api/looks
  ?locale=pt-BR
  &marketProfile=latin-america
  &representation=diverse
  &scenario=event
```

响应需要包括：

- 当前解析后的 Audience Context。
- 已排序妆容列表。
- 每个妆容选中的资产。
- 可选的其他资产数量。
- 当前内容版本。

服务端必须校验 marketProfile 和 locale，不信任客户端传入任意值。

### 10.4 API 兼容策略

- 保留旧 `lookSlug` 一段时间，内部映射到 `recipeId`。
- 新客户端优先传 `marketVariantId`。
- API 仍允许用户选择非当前市场的合法妆容。
- 旧任务缺少新字段时，通过旧 slug 和结果快照正常展示。

---

## 11. UI/UX 架构

### 11.1 全局设置入口

语言与内容偏好必须分开：

```text
语言：简体中文
妆容灵感：东亚灵感
参考模特：多元展示
```

语言菜单只处理语言。内容偏好放在：

- 账户设置。
- `/discover` 顶部轻量入口。
- 首次诊断后的偏好保存提示。

### 11.2 避免增加认知负担

不要在用户首次进入首页时弹出复杂的多步骤问卷。推荐采用渐进式收集：

1. 根据 locale 给默认推荐。
2. 允许用户在 `/discover` 主动切换。
3. 从收藏、点击、试妆行为学习妆感偏好。
4. 登录后提示是否保存。

### 11.3 对用户解释推荐原因

卡片可以显示简短原因：

```text
适合你的偏好：清透、低饱和
来自东亚灵感
与暖中性肤色方向接近
```

推荐原因必须可理解，不能显示“因为你是某人种”。

### 11.4 Light/Dark 与可访问性

- 每组高曝光资产必须同时验证 Light/Dark。
- 正文与背景对比至少达到 WCAG AA。
- 模特切换、灵感地区切换必须支持键盘操作。
- 所有点击区域至少 44×44px。
- 图片加载需要固定宽高或 `aspect-ratio`，避免 CLS。
- 不能仅用肤色缩略图表示分类，必须配文字。

---

## 12. 区域内容研究与妆容专家流程

### 12.1 建立本地专家评审，而不是依赖模型猜测

每个 marketProfile 上线前至少需要：

- 1 名熟悉该市场的专业彩妆师或内容顾问。
- 1 名当地语言编辑。
- 5 至 8 名目标市场用户完成可用性访谈。
- 对核心图片、标题、妆容位置和慎选说明进行复核。

### 12.2 内容研究模板

每个市场需记录：

- 高频使用场景。
- 日常与活动妆的接受强度。
- 气候、持妆和光线需求。
- 常见眼妆与腮红位置偏好。
- 底妆覆盖度与妆效偏好。
- 当地用户如何描述妆容，而不是直接翻译中文术语。
- 容易产生误解或刻板印象的词汇。
- 该市场需要优先补齐的肤色和五官参考。

### 12.3 不把趋势当成永久规则

市场画像需要版本和生效时间：

```ts
{
  marketProfile: "latin-america",
  version: "2026-H2",
  activeFrom: "2026-07-01",
  activeTo: "2026-12-31"
}
```

区域趋势是运营排序信号，不应写死进长期妆容配方。

---

## 13. 分阶段实施路线

### Phase 0：指标基线与内容盘点，1 周

目标：在改造前明确当前效果，避免上线后无法判断价值。

任务：

- 为首页、`/discover`、诊断推荐和试妆选择增加基础事件。
- 记录 locale、页面来源、lookSlug、点击、试妆启动、成功、收藏和分享。
- 盘点现有 44 个妆容图片的模特呈现、肤色深浅、场景和质量。
- 标记可跨市场复用、需要重做和应下线的资产。

验收：

- 能按 locale 查看妆容卡 CTR 和试妆启动率。
- 44 个妆容都有内容与图片审核状态。

### Phase 1：Audience Context 与数据拆分，2 至 3 周

目标：先建立基础架构，不立即大规模换图。

任务：

- 将 i18n locale 升级为 BCP 47 结构。
- 新增 `MarketProfile`、`AudienceContext` 和解析器。
- 拆分 `LookRecipe`、`LookMarketVariant`、`LookLocalization`、`LookAssetVariant`。
- 建立旧 slug 到新 recipeId 的兼容映射。
- 改造 `/api/looks`。
- 新增用户内容偏好表与 Cookie。
- 为任务记录新增 variant/version 字段。

验收：

- 所有页面不再直接导入原始 `lookCatalog`。
- 同一个妆容可以根据 locale 返回不同标题和参考图。
- 用户切换 marketProfile 后全站统一生效。
- 旧链接和旧任务继续可用。

### Phase 2：东亚与全球多元 Pilot，3 至 5 周

目标：用最小图片规模验证区域化是否提升选择与试妆。

任务：

- 选择 8 个核心配方。
- 建立 `east-asia` 与 `global-english` 变体。
- 生成并审核约 48 张核心参考图。
- 区域化首页、`/discover`、诊断示例和试妆推荐。
- 英文默认采用多元人物轮换。
- 上线灵感地区切换与账户偏好保存。

验收：

- 中文与英文首页、妆容库、诊断、试妆呈现一致。
- 英文首屏人物分布符合多元展示目标。
- 用户可以一键查看全球全部妆容。
- 无任何自拍人种推断。
- Pilot 指标达到下文成功门槛。

### Phase 3：拉丁美洲与西欧，4 至 6 周

目标：验证带地区 locale 的真实价值。

任务：

- 上线 `pt-BR`、`es-419`、`de-DE`，再评估 `es-ES`、`pt-PT`。
- 引入当地妆容专家评审。
- 生成高曝光与核心妆容资产。
- 本地化场景、筛选词、顾问建议和 SEO 文案。
- 对巴西与拉美市场做多元肤色覆盖审核。

验收：

- 不同 locale 能解析到正确 marketProfile。
- 语言相同但地区不同的用户可获得不同内容默认值。
- 本地用户测试不存在明显术语误解或刻板印象。

### Phase 4：个性化与运营系统，持续迭代

目标：从规则排序升级到基于行为的个性化。

任务：

- 根据点击、试妆、收藏和跳过学习妆感偏好。
- 建立内容质量分和多元轮换机制。
- 建设内部内容审核面板或轻量 CMS。
- 建立图片版本、审批、下线和回滚流程。
- 扩展南亚、中东、东南亚等市场。

### 13.1 团队角色与建议投入

最小可执行团队：

| 角色 | 主要职责 | Phase 1 至 Phase 2 建议投入 |
|---|---|---|
| 产品经理 | 市场画像、范围控制、指标与实验 | 0.5 至 1 人全程 |
| 技术负责人 | Audience Context、数据模型、迁移与兼容 | 1 人全程 |
| 前端工程师 | 首页、Discover、工作台、设置与响应式验收 | 1 人全程 |
| 后端工程师 | API、数据库、任务快照、偏好保存 | 0.5 至 1 人 |
| AI/提示词工程 | 图片提示词、诊断与试妆链路、自动 QA | 0.5 人 |
| 美术/视觉设计 | 资产风格、构图、Light/Dark 与选图 | 1 人 |
| 彩妆专家 | 配方、位置、可实现性和市场审核 | 每个首发市场至少 1 名顾问 |
| 本地语言编辑 | 本地化术语、场景和文化审核 | 每个新增 locale 兼职投入 |
| QA/数据分析 | 验收矩阵、指标看板和公平性监控 | 0.5 人 |

单人或小团队执行时，应严格按 Phase 顺序推进。不要同时进行架构拆分、五个市场本地化和数百张图片生产。

### 13.2 工作流与责任边界

建议每个妆容变体遵循以下状态流：

```text
市场研究
→ 妆容配方草案
→ 彩妆专家审核
→ 本地化文案
→ 图片生成
→ 美术与公平性审核
→ 技术压缩与接入
→ 页面 QA
→ 小流量实验
→ 正式发布或退回修改
```

每一步都必须有明确负责人和状态。图片生成完成不等于内容可以上线。

---

## 14. 成功指标与停止条件

### 14.1 核心成功指标

按 locale 和 marketProfile 分组监控：

- `/discover` 首屏妆容卡点击率。
- 从妆容卡到试妆启动的转化率。
- 试妆成功后的保存率与分享率。
- 诊断推荐到试妆的转化率。
- 用户主动切换市场画像的比例。
- 用户选择“全部妆容”的比例。
- 用户隐藏或跳过推荐的比例。
- 不同肤色深浅下生成成功率与投诉率。

### 14.2 Pilot 建议门槛

区域化 Pilot 上线 4 周后，至少满足其中三项再扩大资产生产：

- 目标 locale 的 `/discover` 首屏 CTR 提升 10% 以上。
- 妆容卡到试妆启动率提升 8% 以上。
- 诊断推荐点击率提升 10% 以上。
- 用户主动切换画像后，后续点击率继续提升。
- 区域内容负面反馈不高于旧版本。

### 14.3 停止或调整条件

出现以下情况应暂停批量扩张：

- 用户频繁切回“全球全部”，说明默认画像过窄。
- 某 locale 下人物呈现投诉明显增加。
- 特定肤色或群体的生成失败率显著更高。
- 用户认为内容存在刻板印象。
- 新图片 CTR 提升但试妆启动率下降，说明图片吸引但妆容不可执行。

---

## 15. 测试与验收矩阵

### 15.1 自动化测试

- locale 到 marketProfile 映射测试。
- 用户偏好优先级测试。
- 全局 fallback 测试。
- 同一 recipe 在不同 locale 下的标题与资产解析测试。
- `/api/looks` 参数校验测试。
- 旧 `lookSlug` 兼容测试。
- 任务历史快照还原测试。
- 每个 active variant 至少存在一个 approved asset。
- 每个 locale 的核心文案完整性测试。
- 图片路径唯一性和文件存在性测试。

### 15.2 页面验收矩阵

每个重点页面验证：

```text
locale:
  zh-CN
  en
  pt-BR
  es-419
  de-DE

theme:
  light
  dark

viewport:
  390px mobile
  768px tablet
  1280px desktop
  1440px desktop

preference:
  default
  explicit market override
  diverse representation
  explicit representation preference
```

重点页面：

- `/`
- `/discover`
- `/tryon-free`
- `/tryon-pro`
- `/tryon-premium`
- `/diagnosis`
- `/login`
- `/account`
- 历史记录与分享卡

---

## 16. 风险清单

| 风险 | 影响 | 控制方式 |
|---|---|---|
| 将语言误当人种 | 用户不适、品牌风险 | 使用 marketProfile，默认多元，允许覆盖 |
| 图片生产规模失控 | 成本与维护压力 | Tier A/B/C 分层，先 Pilot |
| 不同页面画像不一致 | 产品信任下降 | 全站统一 Audience Context |
| 目录分叉 | Bug 与文案冲突 | 配方、市场、本地化、资产分层 |
| 深肤色生成质量较低 | 公平性与可用性问题 | 独立质量指标与人工审核 |
| 模型自动美白或磨皮 | 妆效误导 | 统一负面提示词和 QA |
| 趋势内容快速过时 | 推荐失效 | 市场变体版本与生效时间 |
| 用户偏好被过度固化 | 推荐单调 | 多元轮换与“全部妆容”出口 |
| 历史记录无法还原 | 用户数据不可信 | 保存 recipeVersion 和 variantId |
| locale 扩展引发大量条件判断 | 技术债务 | 统一 resolver，禁止页面自行分支 |

---

## 17. 建议的首批任务清单

### P0：必须先做

- [ ] 定义 `MarketProfile`、`AudienceContext` 和 fallback 规则。
- [ ] 将 `locale` 升级为完整 BCP 47 设计，至少预留 `pt-BR`、`es-419`、`de-DE`。
- [ ] 拆分当前 `lookCatalog` 的配方、本地化和图片资产。
- [ ] 新增 `resolveAudienceContext()`。
- [ ] 新增 `resolveLookCatalog()`。
- [ ] 改造 `/api/looks` 与试妆任务快照。
- [ ] 为区域化实验补齐分析事件。

### P1：Pilot 内容

- [ ] 从现有 44 个妆容中选择 8 个核心配方。
- [ ] 建立 east-asia 与 global-english 两组市场变体。
- [ ] 生成约 48 张核心参考图并完成专业审核。
- [ ] 重做首页、`/discover`、诊断和工作台的默认推荐。
- [ ] 英文默认使用多元人物轮换。
- [ ] 上线“妆容灵感”切换入口。

### P2：扩展市场

- [ ] 上线 `pt-BR` 与 `es-419`。
- [ ] 上线 `de-DE`，验证西欧画像。
- [ ] 建立当地专家与用户测试流程。
- [ ] 扩展高表现妆容的参考资产。

---

## 18. 本项目推荐的最终决策

### 应该做

- 用语言和地区作为匿名用户的默认推荐起点。
- 用市场画像组织妆容趋势与场景。
- 用用户主动偏好决定参考模特呈现。
- 用诊断信息决定妆容适配，不推断人种。
- 英文默认展示全球多元人物，而不是默认白人。
- 分阶段生成图片，通过数据决定扩展方向。
- 让 `/discover` 成为偏好调整与跨市场探索的核心入口。

### 不应该做

- 不要建立“中文目录、英文目录、葡萄牙语目录”三套互相复制的数据。
- 不要根据自拍判断用户人种。
- 不要把某一地区等同于单一肤色或单一妆容风格。
- 不要一次生成数千张未经验证的区域图片。
- 不要只改 `/discover`，而忽略首页、诊断、工作台和历史记录。
- 不要让用户默认画像成为内容限制。

---

## 19. 外部决策依据

- [IETF BCP 47 / RFC 5646](https://datatracker.ietf.org/doc/html/rfc5646)：语言标签可以包含语言、脚本与地区，项目应使用完整 locale，而不是只使用 `en`、`es`、`pt`。
- [W3C Language Tags](https://www.w3.org/International/articles/language-tags/)：Web 国际化应基于 BCP 47 语言标签。
- [Google Monk Skin Tone Scale](https://skintone.google/the-scale)：用于建立更具包容性的肤色深浅评估与内容审核参考。
- [Google Skin Tone Annotation Research](https://research.google/blog/consensus-and-subjectivity-of-skin-tone-annotation-for-ml-fairness/)：肤色标注具有主观性，需要一致的标注流程、样例和人工训练。
- [McKinsey Global Beauty 2025](https://www.mckinsey.com/industries/consumer-packaged-goods/our-insights/a-close-look-at-the-global-beauty-industry-in-2025)：全球美妆市场差异明显，研究覆盖巴西、中国、日本、韩国、德国、英国、美国等多个市场，支持采用市场级内容策略而非单一全球目录。

---

## 20. 下一步建议

下一次实施工作应从 **Phase 0 与 Phase 1 的基础架构** 开始，而不是立即生成新图片。

建议第一个可交付 PR 的范围：

1. 新增 `AudienceContext` 与 marketProfile 映射。
2. 将当前 `lookCatalog` 拆为 recipe、localization、asset 三层，但保持页面行为不变。
3. 新增兼容旧 API 的 `resolveLookCatalog()`。
4. 为 `/discover` 增加只读的“当前灵感画像”提示。
5. 添加自动化测试，确保旧 44 个妆容和旧链接不受影响。

该 PR 完成后，再开始 8 个核心妆容的东亚与全球多元 Pilot 图片生产。
