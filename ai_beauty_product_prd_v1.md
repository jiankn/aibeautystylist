# AI 试妆与化妆教程产品落地文档（女性用户版）

## 0. 文档定位

本文档基于前序讨论整理，目标是把产品想法收束为一份可以直接用于后续设计、开发、内容、运营协作的落地文档。

适用角色：
- 产品经理
- UI / UX 设计师
- 前端 / 全栈开发
- 增长与 SEO 负责人
- 内容与视觉运营
- 图像生成与提示词执行人员

产品方向：
**面向女性用户的 AI 个性化试妆 + 化妆教程 + 工具 / 产品推荐平台**

部署约束：
- 优先使用 **Cloudflare 免费服务**
- 需要 **会员管理**
- 需要 **订阅产品能力**
- 需要 **多语言架构**
- 首页需使用大量妆后图片激发灵感与转化

---

## 1. 一句话定义

这不是一个“会给照片上妆的工具”，而是一个：

**AI 个性化变美顾问 / AI 化妆教练**

它帮助女性用户完成四件事：
1. 找到适合自己的妆容方向
2. 先看到自己妆后的样子
3. 获得可执行的个性化化妆教程
4. 获得更省钱、更不容易踩坑的工具 / 产品建议

---

## 2. 第一性原理下，用户真正想获得什么

用户想要的不是“更多美妆教程”，而是：

- **适合我的答案**，而不是别人的模板
- **先看到结果**，降低试错成本
- **能跟着做出来**，而不是只看成品图
- **少花冤枉钱**，知道先买什么最有效
- **更快变好看**，而不是系统学习全部美妆知识
- **形象管理的掌控感**，提升自信与确定性

一句话总结：

**用户不是来上课的，用户是来解决“我怎么更适合、更好看、更省钱地变美”这个问题的。**

---

## 3. 产品目标与价值主张

### 3.1 用户价值主张

- 上传一张素颜照，获得适合自己的妆容方案
- 不是只看效果图，而是获得一步步教程
- 教程不是通用套路，而是针对脸型、肤色、妆容目标生成
- 工具与产品推荐与教程绑定，帮助用户少踩坑
- 不同场景下持续获得新的妆容建议与调整

### 3.2 商业价值主张

- 免费版卖“惊喜与希望”
- 会员版卖“执行与落地”
- 订阅版卖“长期省心与持续判断”

一句话：

**用户付费，不是为了看 AI 画得多美，而是为了更确定、更省钱、更省时间地把自己变美。**

---

## 4. 核心用户与使用场景

### 4.1 核心用户

#### A. 新手入门型
特点：
- 会看美妆内容，但不会自己判断
- 怕复杂、怕买错、怕翻车
- 希望低门槛快速上手

核心诉求：
- 最少步骤
- 最低成本
- 最明显变化

#### B. 轻度进阶型
特点：
- 已经会基础化妆
- 总觉得差一点，不够精致
- 想提升稳定性与高级感

核心诉求：
- 细节诊断
- 区域优化
- 风格升级

#### C. 场景驱动型
特点：
- 不一定天天研究化妆
- 但在特定场景强需求明显

典型场景：
- 通勤
- 约会
- 面试
- 拍照
- 参加婚礼 / 聚会
- 换季 / 假日出游

核心诉求：
- 快速方案
- 更强确定性
- 对应场景的一次性高质量输出

---

## 5. MVP 核心闭环

第一版最应打透的不是十几个功能，而是一个最小但完整的用户闭环：

1. 用户上传素颜照
2. **系统生成「AI 面部与色彩诊断报告」（分析肤色冷暖、脸型骨相特征，建立专家信任感）**
3. 系统基于诊断结果，输出 3 套量身定制的个性化妆容方案
4. 用户选择其中 1 套
5. 系统生成 6～8 步个性化教程
6. 系统输出**与真实大牌/平价 SKU（如 MAC, NARS 等）强绑定**的工具/产品建议，并**挂载分销(Affiliate)链接**
7. **生成带有品牌水印的「诊断结果 / 妆前妆后对比」社交裂变海报，引导用户分享**
8. 引导用户升级会员或订阅获取更完整价值

第一版不要优先做：
- 社区 / UGC
- 复杂实时 AR
- 海量商城
- 复杂肤质深度诊断
- 成分党数据库
- 复杂视频编辑器

MVP 目标是验证：

**用户是否愿意为“更适合我、我学得会、我买得对”的变美方案付费。**

---

## 6. 三个核心付费功能

### 6.1 个性化妆容方案生成
解决问题：
**我适合什么妆？**

输出不是几张图，而是一组“妆容方案卡”：
- 妆容名称
- 适合原因
- 适用场景
- 上手难度
- 所需时间
- 重点提升区域
- 预览妆效图

### 6.2 目标妆容反向拆解教程
解决问题：
**我怎么做到？**

输出不是长文章，而是可执行的步骤卡：
- 步骤名
- 区域示意
- 工具说明
- 动作说明
- 错误提醒
- 自检点

### 6.3 个性化工具 / 产品购买决策系统
解决问题：
**我该买什么？**

输出建议：
- **真实 SKU 绑定**：放弃泛泛的“灰粉色口红”描述，直接推荐具体的真实商品（如：MAC 子弹头 #Mehr，或平价替代 NYX #Euro Trash）。
- **Affiliate 商业化**：优先推荐支持 Amazon Associates, Sephora, Ulta 分销联盟的商品，跑通早期现金流。
- 必买清单与可替代清单
- 平价版 / 标准版 / 进阶版 真实商品库匹配
- 当前不建议买什么（排雷指南，增强信任）
- 与教程步骤绑定的工具建议

---

## 7. 免费版 / 会员版 / 订阅版设计

### 7.1 免费版
定位：
**让用户看到希望，感受到“它懂我”。**

提供：
- 1 次照片分析
- 1～2 套基础妆容方案
- 简版预览图
- 3 步以内简版教程
- 基础品类建议
- 次数限制

不提供：
- 完整教程
- 高清多场景妆效
- 深度适配逻辑
- 预算分层工具建议
- 历史档案与持续跟踪

### 7.2 会员版（Pro）
定位：
**让用户真的能照着做出来。**

提供：
- 更多妆容方案
- 多场景妆容推荐
- 高清妆效图
- 完整教程
- 工具绑定
- 错误提醒
- 自检点
- 预算分层推荐
- 妆容历史记录

### 7.3 订阅版（Premium）
定位：
**让用户以后不用自己费劲判断。**

提供：
- 高额度或无限生成
- 季节 / 场景持续更新建议
- 风格档案持续成长
- 动态教程修正
- 已购产品管理与替换建议
- 长期工具升级路径
- 历史妆容沉淀与复用

### 7.4 单次增值包（建议保留）
适合不愿立刻订阅，但有强场景需求的用户：
- 单次完整场景妆容包
- 单次高级教程包
- 单次预算采购方案包

---

## 8. UI / UX 总体设计原则

### 8.1 定位不是粉色 SaaS，而是 Beauty Stylist
整体气质应为：
- 时尚编辑感（Editorial）
- 轻奢柔和感（Soft Luxury）
- 私人顾问感（Guided Personalization）

### 8.2 视觉关键词
- Quiet Luxury Beauty Tech
- Editorial Feminine
- Soft-focus premium
- Warm neutral palette
- Rose nude accents
- Beauty concierge UI

### 8.3 配色原则
基础底色：
- 奶油白
- 暖白
- 浅雾粉灰
- 香槟灰

品牌强调色：
- 玫瑰裸粉
- 灰调藕粉
- 柔莓色
- 香槟金点缀

避免：
- 廉价大粉色
- 过度少女感
- 纯工具式企业后台感

### 8.4 交互原则
- 一次只让用户做一个决定
- 先场景、后配置
- 多推荐式文案，少参数式文案
- 用引导，不用命令
- 降低上传自拍的心理门槛

### 8.5 信息架构原则
不做功能堆砌，做任务型导航：
- Discover / 发现适合我的妆
- Try On / 试妆
- Tutorial / 跟着画
- Beauty Kit / 工具与推荐
- Membership / 会员

---

## 9. 首页、试妆页、教程页、会员页设计

## 9.1 首页设计

### 首页任务
- 激发期待
- 建立信任
- 引导上传第一张照片
- 用妆后灵感图刺激点击和探索

### 首页结构

#### 第一屏：品牌主张 + Hero 图
主标题方向：
- 找到真正适合你的妆，而不是别人的教程
- 上传一张素颜照，看到更适合你的妆容与步骤
- AI 不只帮你试妆，更帮你学会怎么变好看

内容：
- 一句强主张
- 一句解释性副标题
- 主 CTA：开始试妆
- 次级 CTA：看看适合我的风格
- 1～3 张高质感 Hero 妆后图

#### 第二屏：灵感图区
使用大量妆后图，做成横滑 / 瀑布流：
- 通勤提气色
- 温柔约会
- 轻熟精致
- 上镜拍照
- 新手日常
- 高级晚宴

目标：
- 激发“我也想试”
- 增加停留与点击
- 形成品牌审美

#### 第三屏：场景入口
场景卡形式：
- 上班 10 分钟提气色
- 面试显精神
- 约会更温柔
- 拍照更上镜
- 新手第一次化妆

#### 第四屏：怎么工作
3 步轻说明：
1. 上传素颜照
2. 选择适合你的妆容方案
3. 获得教程和工具推荐

#### 第五屏：可信度 / 适配广泛证明
展示：
- 不同肤色
- 不同脸型
- 不同年龄气质
- 不同妆容强度

#### 第六屏：会员价值预埋
- 免费：先看看适合什么
- 会员：获得完整教程与高清试妆
- 订阅：持续获得风格与工具建议更新

---

## 9.2 试妆页设计

### 试妆页任务
- 把一次技术处理，变成一次 Beauty Stylist 体验

### 试妆流程
1. 上传前引导
2. 上传后分析反馈
3. 输出妆容方案卡
4. 用户选择方案
5. 查看妆前妆后结果
6. 引导进入教程

### 页面结构
- 顶部：上传与隐私说明
- 中部：大图对比区（原图 / 妆后切换）
- 侧边：妆容方案卡
- 下部：适合原因 / 难度 / 时间 / 场景 / CTA

### 关键体验点
- 不是加滤镜，而是替用户做选择
- 局部放大对比要清晰
- 文案要像顾问在解释，不像模型日志

### 版本差异
免费版：
- 1～2 套基础方案
- 标清预览
- 简要适配理由

会员版：
- 更多方案
- 高清预览
- 可微调
- 多场景切换

订阅版：
- 历史妆容保存
- 风格档案成长
- 季节 / 场景持续更新

---

## 9.3 教程页设计

### 教程页任务
- 降低执行门槛
- 像陪练，不像文章

### 页面结构

#### 顶部：目标妆容摘要
- 妆容名
- 适合原因
- 重点提升区域
- 所需时间
- 难度
- 新手 / 标准 / 快速版切换

#### 中部：步骤卡
每步包含：
- 步骤名称
- 区域图示
- 工具图标
- 动作说明
- 错误提醒
- 自检点

#### 底部：最低可行工具包
- 必备
- 可替代
- 预算升级
- 当前可跳过

### 交互增强建议
- 完成 / 不会 / 想看更简单版本 按钮
- 可收藏教程
- 可切换预算模式

### 版本差异
免费版：
- 前 3 步预览
- 无完整示意 / 自检 / 错误提醒

会员版：
- 完整教程
- 工具绑定
- 错误提醒
- 自检点

订阅版：
- 动态修正教程
- 长期记录问题区域
- 个性化持续优化

---

## 9.4 会员页设计

### 会员页任务
- 卖“长期省心”，而不是卖一堆功能点

### 页面结构

#### 第一部分：先卖结果
- 免费：看看适合什么
- 会员：把适合你的妆真正学会
- 订阅：以后由 AI 持续替你判断

#### 第二部分：视觉化展示会员价值
- 高清妆效图
- 完整教程卡
- 预算工具包
- 场景妆容更新
- 历史妆容档案

#### 第三部分：价格区
风格建议：
- 不做冷冰冰价格表
- 做成 Beauty Pass / Membership Card 感

#### 第四部分：FAQ
- 是否支持隐私删除
- 是否可取消订阅
- 不同语言是否可用
- 是否适合新手

---

## 10. 首页大量妆后图策略

首页图不是装饰，而是转化系统的一部分。

### 10.1 首页图片承担的 4 个任务
1. 给用户灵感
2. 让用户代入
3. 建立品牌审美信任
4. 推动点击与试妆

### 10.2 首页图片四大类

#### A. Hero 主视觉图
任务：
- 传达品牌气质
- 一眼高级
- 激发“我也能变这样”的想象

建议方向：
- 清透日常高级妆
- 温柔约会妆
- 轻熟精致妆

#### B. Inspiration 灵感图区图片
任务：
- 展示风格多样性
- 刺激探索欲
- 形成风格点击入口

建议类别：
- 清透裸妆
- 通勤提气色妆
- 温柔约会妆
- 轻熟精致妆
- 减龄甜感妆
- 上镜拍照妆
- 高级晚宴妆
- 趋势氛围妆

#### C. Scenario 场景入口图
任务：
- 强化需求代入
- 让用户快速找到当前目标

#### D. Trust 可信度图
任务：
- 展示不同肤色 / 脸型 / 年龄气质
- 告诉用户：不是只有模特脸才能用

### 10.3 首页图片矩阵
建议按以下维度建立素材库：
- 妆容风格
- 妆容强度（轻 / 中 / 高）
- 人物类型
- 语言市场 / 人种本地化
- 页面用途（Hero / 灵感卡 / 场景卡 / 会员页）

### 10.4 首页初始素材规模建议
MVP 第一版建议至少准备：
- Hero 图：3 张
- 灵感卡：24 张（8 类 × 3 张）
- 场景卡：12 张
- 信任图：12 张

合计约 50 张。

### 10.5 妆容库数量与扩容策略

首页与 try-on 的妆容数量不能只按“越多越好”扩张。妆容库承担三个不同任务：

1. **商业转化**：让用户觉得选择足够丰富，愿意上传自拍尝试。
2. **美妆专业度**：覆盖真实场景、肤色、年龄、眼型、妆感强度，而不是只换名字。
3. **多语言本地化**：不同语言市场看到的妆感、人群和表达应更贴近当地审美。

#### 推荐数量路线

| 阶段 | 妆容总量 | 目标 | 使用位置 |
|------|----------|------|----------|
| **当前扩容** | 约 **36 个核心妆容** | 立刻提升产品丰富度，支撑首页和 try-on 选择 | 首页精选、try-on 右侧推荐、All Looks 抽屉 |
| **英文 SEO 成熟后** | 约 **48 个全球核心妆容** | 覆盖主要场景、风格、肤色、眼型、年龄与拍照需求 | 英文风格页、场景页、教程页、会员权益 |
| **多语言扩张期** | 约 **72 个妆容资产** | 48 个全球核心妆容 + 24 个本地化变体 | 各语言首页、try-on 推荐、语言 Hub、部分 SEO 页面 |

#### 第一批新增妆容建议

当前 try-on 与首页可感知妆容偏少，建议先新增 **18 个核心妆容**，把可展示妆容从约 18 个扩到约 36 个：

| 类别 | 新增妆容 |
|------|----------|
| **日常 / 通勤** | Soft Matte Everyday、Warm Nude Daily、Peach Morning Glow |
| **职场 / 专业** | Client Meeting Nude、Executive Rose、Passport Photo Clean |
| **拍照 / 镜头** | Flash-Proof Satin、Creator Camera Glow |
| **约会 / 柔和氛围** | Candlelight Mauve、Rose Milk Date、Peach Beige Date |
| **晚宴 / 活动** | Bronze Evening、Burgundy Velvet、Champagne Gala |
| **新手 / 快速完成** | Five-Minute Beginner |
| **肤色 / 特征适配** | Olive Undertone Rose、Hooded Eyes Lift、Mature Skin Radiance |

#### 36 个核心妆容的结构要求

36 个核心妆容应按以下配额组织，避免出现“名字很多，但视觉和用户任务重复”的问题：

| 维度 | 最低覆盖 |
|------|----------|
| **日常低门槛** | 8 个 |
| **职场 / 通勤 / 面试** | 6 个 |
| **约会 / soft glam** | 6 个 |
| **拍照 / 视频 / 婚礼客人** | 6 个 |
| **晚宴 / event glam** | 4 个 |
| **新手 / 5-10 分钟快速妆** | 3 个 |
| **肤色、年龄、眼型适配** | 3 个 |

#### 48 个全球核心妆容的结构要求

当英文站开始验证自然搜索、试妆和会员转化后，将 36 个扩到 **48 个全球核心妆容**。新增的 12 个不应只是风格换名，而应补齐：

- 深肤色、橄榄皮、冷暖中性 undertone 的上镜妆。
- 成熟肌、hooded eyes、round face、long face 等特征适配。
- 会员页可展示的“完整教程 + 工具包 + 不建议购买清单”妆容。
- 可复用到教程页、风格页、场景页的高价值妆容。

#### 72 个多语言妆容资产结构

多语言阶段建议使用：

**48 个全球核心妆容 + 24 个本地化妆容变体 = 约 72 个妆容资产。**

本地化变体不一定全部进入 sitemap。它们主要服务首页、try-on、语言 Hub 和会员内容，让当地用户第一眼觉得“这像是为我做的”。

| 语言 / 市场 | 本地化变体建议 | 本地化重点 |
|-------------|----------------|------------|
| **English (en)** | 使用 48 个全球核心妆容 | 多肤色、多族裔、clean girl、soft glam、work makeup、date night |
| **Deutsch (de)** | 3 个 | 自然、专业、可信、隐私友好、少踩雷 |
| **Français (fr)** | 3 个 | 法式自然、高级、轻盈底妆、审美感强但不硬卖 |
| **日本語 (ja)** | 4 个 | 透明感、似合うメイク、垢抜け、温柔约会、轻办公 |
| **한국어 (ko)** | 4 个 | glass skin、personal color、cool/warm tone、氛围感 |
| **繁體中文 (zh-TW)** | 3 个 | 通勤提气色、約會妝、個人色彩、適合我的口紅 |
| **Español (es)** | 3 个 | bronzed glow、warm glam、expressive lips、defined eyes |
| **Português do Brasil (pt-BR)** | 2 个 | 健康光泽、活力感、自然但有生命力 |
| **العربية (ar)** | 2 个 | refined eyes、elegant glam、luminous skin、文化得体表达 |

如果后续西语、巴葡、阿语被证明有稳定流量和付费潜力，可将本地化变体从 24 个扩展到 30-36 个；但第一轮不建议超过 72-84 个总资产，否则图片生成、质量控制、翻译、SEO 去重和维护成本会过快上升。

#### UI/UX 展示原则

- 首页只展示精选妆容，不展示全部 36/48/72 个。
- `Get Inspired` 保持图片优先，文案只保留风格名和短标签。
- `Try a style` 展示 6-8 个高转化风格入口。
- `/try-on` 可以使用 `View all looks` 抽屉承载完整妆容库，并提供分类筛选。
- 移动端必须使用横向滚动精选 + 底部抽屉，不把几十个妆容一次性纵向堆在首页。

#### 数据结构与试妆链路要求

- 每个核心妆容必须有稳定 `slug`、英文标题、短标签、图片、`imageAlt`、场景、分类和 AI intent。
- 首页 `Get Inspired`、try-on 右侧精选、`View all looks` 抽屉必须引用同一份妆容 catalog，避免页面之间名称、图片、链接不一致。
- 从首页或抽屉点击妆容进入 `/try-on` 时，URL 应保留 `scenario` 和 `look` 参数，方便后续统计不同妆容的点击、上传自拍和会员转化。
- 用户上传自拍时，已选择的 `look` 应随请求发送给诊断服务；AI 应把它当作用户偏好，而不是机械复制，仍需按肤色、脸型、眼型和经验水平调整。

#### 视觉资产去重要求

- 36 个妆容第一阶段至少应达到 **18 张独立妆容图**，避免用户在 All Looks 抽屉里看到大量重复人像而误判产品内容不足。
- 优先补图顺序：拍照/证件照、晚宴、特征诊断、约会、本地化人群；日常和新手妆可以短期保留较高复用。
- 新生成项目图统一压缩为 720x1280 WebP，用于移动端卡片和桌面抽屉，避免原始 PNG 直接进入页面资源。
- 每张图必须明确服务一个妆容 slug，不使用“通用美女图”替代专业妆容差异。
- 当前第一批专属补图：`passport-photo-clean`、`flash-proof-satin`、`champagne-gala`、`burgundy-velvet`、`hooded-eyes-lift`、`mature-skin-radiance`。

#### SEO 准入原则

妆容资产数量不等于可索引页面数量。建议：

- 英文站优先只做 **24-32 个高价值 SEO 页面**。
- 每个新增语言首批只做 **8-12 个强本地化页面**。
- 其余妆容作为 try-on 内部选择、教程推荐或会员权益内容，不进入 sitemap。
- 只有具备唯一搜索意图、独立标题、H1、meta description、首屏直接回答、FAQ、内部链接和信息增益的妆容，才允许成为可索引页面。
- 避免为每个妆容 × 每种语言批量生成近似模板页，防止 `Crawled - currently not indexed` 和薄内容风险。

---

## 11. 多语言页面与人种 / 妆感本地化策略

原则：
**统一品牌审美 + 局部本地化人物与妆感**

### 11.1 英语页
人物：
- 白人女性
- 拉丁裔女性
- 黑人女性
- 南亚裔女性
- 东亚裔女性

妆感：
- clean girl
- natural radiant
- soft glam
- work makeup
- date night makeup

重点：
- 多元包容
- 现代感

### 11.2 日语页
人物：
- 东亚女性为主

妆感：
- 透明感
- 通透裸感
- 温柔约会妆
- 轻眉妆
- 细腻腮红

### 11.3 韩语页
人物：
- 东亚女性为主

妆感：
- 水光肌
- 卧蚕
- 渐变唇
- 韩系轻熟感

### 11.4 简中 / 繁中页
人物：
- 东亚女性为主，可少量混血感脸模做时尚区块

妆感：
- 通勤提气色
- 温柔约会
- 轻熟精致
- 显白上镜
- 新手低门槛

### 11.5 西语页
人物：
- 拉丁裔女性为主

妆感：
- warm glam
- bronzed glow
- soft date makeup
- expressive lips
- wearable defined eyes

### 11.6 葡语页（优先巴西）
人物：
- 拉美人群为主

妆感：
- 活力感
- 光泽底妆
- 健康肤色表达
- 自然但有生命力

### 11.7 阿语页
人物：
- 中东 / 北非特征女性

妆感：
- elegant glam
- refined eyes
- luminous skin
- 精致眉眼与轮廓

注意：
- 服饰 / 露肤程度保持得体
- 尊重文化语境

---

## 12. Nano Banana Pro 图片提示词体系

说明：以下为可直接交付图像生成执行的提示词框架。模型名按你当前内部命名使用“Google Nano Banana Pro”。

### 12.1 总提示词框架
每张图由 6 个模块组成：

1. 人物身份模块
2. 妆容风格模块
3. 妆面细节模块
4. 摄影与构图模块
5. 页面用途模块
6. 负面限制模块

### 12.2 母提示词（品牌级）

```text
premium beauty editorial, feminine but modern, soft luxury, aspirational yet relatable, realistic makeup detail, inclusive beauty, elegant clean background, warm refined color palette, high-end beauty campaign aesthetic, soft diffused lighting, hyper-realistic skin texture with visible pores and natural micro-imperfections, completely avoiding AI plastic or heavily airbrushed look, polished but natural, premium cosmetic brand photography
```

### 12.3 负面提示词（通用）

```text
no exaggerated retouching, no plastic skin, no cartoon style, no low-resolution artifacts, no cluttered background, no text, no watermark, no extra fingers, no distorted facial features, no heavy surreal fashion makeup unless specified, no blocked face, no harsh flash look
```

---

## 12.4 首页 Hero 图提示词模板

```text
[人物身份模块], [妆容风格模块], [妆面细节模块], luxury beauty editorial photography, soft diffused lighting, premium cosmetic campaign aesthetic, close-up portrait, elegant clean background, hero banner composition with negative space for headline, highly realistic makeup detail, flattering skin texture, sophisticated and aspirational, [品牌级母提示词], [负面提示词]
```

### Hero 示例 1（中文站 / 轻熟精致）

```text
28-year-old East Asian woman, soft oval face, natural straight dark hair, warm neutral skin tone, elegant and approachable, polished office makeup, luminous natural skin, softly defined straight brows, subtle taupe eye shadow, thin eyeliner, soft muted rose blush placed high on the cheeks, satin rose-nude lips, luxury beauty editorial photography, soft diffused lighting, premium cosmetic campaign aesthetic, close-up portrait, elegant clean warm ivory background, hero banner composition with clean negative space for headline, highly realistic makeup detail, flattering skin texture, sophisticated and aspirational, premium beauty editorial, feminine but modern, soft luxury, aspirational yet relatable, realistic makeup detail, inclusive beauty, warm refined palette, no exaggerated retouching, no plastic skin, no cartoon style, no text, no watermark
```

### Hero 示例 2（英语站 / clean girl）

```text
26-year-old mixed-ethnicity woman, light olive skin, balanced facial proportions, glossy dark brown hair, confident and fresh, clean everyday makeup, radiant natural skin, softly brushed brows, light neutral eye makeup, barely-there eyeliner, subtle peach blush, glossy nude lips, luxury beauty editorial photography, soft natural lighting, premium cosmetic campaign aesthetic, close-up portrait, warm beige background, hero banner composition with negative space for headline, highly realistic makeup detail, aspirational yet relatable, premium beauty editorial, feminine but modern, soft luxury, inclusive beauty, no exaggerated retouching, no plastic skin, no cluttered background, no text, no watermark
```

### Hero 示例 3（西语站 / warm glam）

```text
30-year-old Latina woman, medium tan skin, defined cheekbones, dark wavy hair, radiant and confident, soft warm glam makeup, luminous bronzed skin, softly arched brows, warm brown eye makeup, defined lashes, peach-bronze blush, satin terracotta nude lips, luxury beauty editorial photography, soft diffused lighting, premium cosmetic campaign aesthetic, close-up portrait, warm sand background, hero banner composition with elegant negative space for headline, highly realistic makeup detail, premium beauty editorial, feminine but modern, soft luxury, aspirational yet relatable, no exaggerated retouching, no plastic skin, no harsh flash, no text, no watermark
```

---

## 12.5 灵感图区图片模板

```text
[人物身份模块], [妆容风格模块], [妆面细节模块], premium beauty editorial portrait, soft flattering lighting, inspiration card composition, high-end beauty campaign, stylish but relatable, clean background, medium close-up, highly realistic makeup detail, expressive but wearable, [品牌级母提示词], [负面提示词]
```

### 灵感类别建议
1. 清透裸妆
2. 通勤提气色妆
3. 温柔约会妆
4. 轻熟精致妆
5. 减龄甜感妆
6. 上镜拍照妆
7. 高级晚宴妆
8. 趋势氛围妆

### 灵感图示例（约会妆 / 日语页）

```text
24-year-old East Asian woman, delicate features, soft fair-neutral skin, silky dark hair with light movement, gentle and romantic mood, soft romantic date makeup, translucent skin finish, softly straight brows, rosy beige eye shadow, subtle eyeliner, soft pink blush, blurred rosy lips, premium beauty editorial portrait, soft flattering lighting, inspiration card composition, clean pale blush background, highly realistic makeup detail, stylish but relatable, feminine but modern, soft luxury, no exaggerated retouching, no plastic skin, no text, no watermark
```

---

## 12.6 场景卡图片模板

```text
[人物身份模块], [妆容风格模块], [妆面细节模块], premium beauty campaign photography, scenario-focused composition, lifestyle-inspired but polished, clean and elegant background, medium portrait, mobile-friendly crop, realistic wearable makeup, [品牌级母提示词], [负面提示词]
```

### 场景建议
- 上班 10 分钟提气色
- 第一次约会温柔妆
- 面试显精神妆
- 夏日清爽不脏妆
- 拍照更上镜
- 新手第一次化妆

### 场景图示例（面试妆 / 英语页）

```text
29-year-old South Asian woman, medium warm skin tone, clear expressive eyes, sleek dark hair, professional and confident presence, polished interview makeup, natural semi-matte skin, defined but soft brows, light brown eye definition, subtle eyeliner, muted peach blush, satin pink-brown lips, premium beauty campaign photography, scenario-focused composition, lifestyle-inspired but polished, clean warm ivory background, medium portrait, mobile-friendly crop, realistic wearable makeup, premium beauty editorial, soft luxury, aspirational yet relatable, no exaggerated retouching, no plastic skin, no cluttered background, no text, no watermark
```

---

## 12.7 信任图模板（多肤色 / 多脸型）

```text
[人物身份模块], [妆容风格模块], [妆面细节模块], premium realistic beauty portrait, inclusive beauty campaign style, simple clean background, authentic and flattering, detailed but natural skin texture, medium close-up, highly relatable, [品牌级母提示词], [负面提示词]
```

### 信任图用途
- 展示不同肤色适配
- 展示不同五官类型也能得到好效果
- 用于首页、会员页、FAQ 区块

---

## 12.8 市场级模板建议

### 中文站基础模板
```text
East Asian woman, approachable, elegant, realistic daily beauty, suitable for office / date / photo-ready scenes, polished but not overdone, refined warm-neutral palette
```

### 英语站基础模板
```text
inclusive beauty, ethnically diverse women, modern and aspirational, wearable makeup, clean beauty campaign style, premium but relatable
```

### 日语站基础模板
```text
East Asian woman, transparent soft beauty, delicate and refined, lightweight natural makeup, subtle color balance, airy and elegant
```

### 韩语站基础模板
```text
East Asian woman, luminous skin, polished K-beauty feel, soft contour, subtle glam, youthful but sophisticated
```

### 西语站基础模板
```text
Latina woman, warm radiant beauty, expressive features, soft glam with warmth, confident and vibrant, polished wearable makeup
```

### 阿语站基础模板
```text
Middle Eastern woman, elegant refined beauty, luminous complexion, defined eyes and brows, sophisticated and culturally respectful styling
```

---

## 13. SEO 结构补充（非常关键）

这个项目不是只有产品页，还应该有内容增长层。

### 13.1 SEO 定位
目标不是做泛流量美妆站，而是做：
**高意图、场景型、个性化妆容决策入口**

### 13.2 SEO 重点内容类型

#### A. 场景型内容页
- 面试妆怎么化
- 通勤提气色妆
- 第一次约会化妆步骤
- 拍证件照适合什么妆

#### B. 人群型内容页
- 黄皮适合什么口红
- 肿眼泡怎么画眼妆
- 新手化妆先买什么
- 单眼皮适合什么妆

#### C. 风格型内容页
- clean girl makeup
- soft glam makeup
- 温柔约会妆
- 轻熟精致妆

#### D. 工具 / 购买决策型内容页
- 新手化妆工具清单
- 平价化妆刷推荐
- 通勤妆必备单品

### 13.3 SEO 与产品打通方式
内容页不是独立博客，而要处处导向：
- 上传照片试妆
- 查看适合我的风格
- 解锁完整教程
- 获取专属工具清单

### 13.4 多语言 SEO 原则
- 每个语言站不只翻译，要做本地化关键词
- 页面人物、妆感、案例也要本地化
- hreflang、canonical、slug 结构要规范

---

## 14. Cloudflare 免费部署架构建议

说明：这里以“优先 Cloudflare 免费能力”为原则，按可落地路径设计。后续若会员与订阅增长较快，再做局部升级。

### 14.1 推荐技术栈
- 前端：Astro（明确作为前端主框架，优先适配 Cloudflare Pages）
- 原因：相较 Next.js，Astro 在当前 Cloudflare 部署场景中更轻、更稳、更适合内容站 + 微工具 + 落地页的混合架构
- 托管：Cloudflare Pages
- Serverless API：Cloudflare Workers
- 数据存储：Cloudflare D1（轻量结构化）
- 对象存储：Cloudflare R2（用于结果图 / 素材）
- 缓存：Cloudflare Cache
- 可选状态：KV（轻量读取场景）
- 鉴权：建议使用外部成熟 Auth 服务或轻量自建邮箱登录方案
- 订阅支付：Stripe
- 邮件：可对接第三方邮件服务

### 14.2 免费版边界提醒
Cloudflare 免费层适合：
- MVP 验证
- 内容站 + 基础产品
- 轻量 API 调用编排

但需要注意：
- 重 CPU 图像处理不适合直接在 Worker 内完成
- AI 图像生成应由外部模型服务或专门推理端承担
- 大文件处理与复杂队列能力要谨慎设计

### 14.3 推荐分工
- Cloudflare 负责：前端、API 编排、权限、会员状态、缓存、结果页展示
- 外部模型服务负责：妆效图生成、图像分析、复杂 AI 推理
- 外部支付负责：订阅扣费与 Portal

### 14.4 会员与订阅数据
需要至少存这些核心表：
- users
- subscriptions
- plans
- usage_records
- tryon_jobs
- saved_looks
- tutorials
- recommended_kits
- locale_preferences

---

## 15. 隐私、合规与信任设计（必须补充）

这是项目必须提前写进 PRD 的部分，否则后面返工巨大。

### 15.1 用户最敏感的点
- 上传的是自己正脸照片
- 是否会保存
- 是否会被用于训练
- 是否可以删除
- 结果是否真实可靠

### 15.2 产品必须明确提供
- 上传前的用途说明
- 是否保存、保存多久
- 是否用于模型训练
- 用户删除入口
- 隐私政策与条款链接
- AI 生成结果仅供参考的适度声明

### 15.3 交互建议
在上传入口附近明确写：
- 仅用于生成你的个性化妆容与教程
- 你可随时删除照片与结果
- 未经同意不用于公开展示或模型训练

---

## 16. 还有 6 个关键补充建议

### 16.1 上传前要有心理缓冲
不要第一屏直接怼上传框。先让用户被灵感图、场景、价值说服。

### 16.2 结果页要可分享
生成的妆容方案可以做轻分享卡，用于社交传播与拉新。

### 16.3 首页图片要可点击，不要只是展示
所有首页灵感图都应指向试妆流程或风格页。

### 16.4 教程语言要“像顾问”，不能像百科
语气要鼓励、轻柔、专业，不要像技术说明书。

### 16.5 工具推荐要真诚
必须包含“当前不建议买什么”，这样更容易建立信任。

### 16.6 多语言先做重点市场，不要一次铺太大
建议先从高妆容消费 / 高线上美妆接受度语言市场中选优先级高的几种语言上线，再逐步扩展。

---

## 17. 现在是否可以进入设计与开发文档阶段？

可以。

当前方案已经足以进入下一阶段文档输出，包括：
- 详细 PRD
- UI / UX 设计规范
- 页面线框说明
- Cloudflare 技术架构文档
- 数据库与权限设计
- 会员 / 订阅与支付流程说明
- SEO 内容结构文档
- 图像提示词执行手册

---

## 18. 下一步建议输出的子文档

建议后续拆为以下几个 markdown：

1. `PRD.md`
2. `UI_UX_Spec.md`
3. `Cloudflare_Architecture.md`
4. `Membership_and_Subscription.md`
5. `SEO_and_Content_Structure.md`
6. `Image_Prompt_Library.md`
7. `MVP_TODOs.md`

---

## 19. 本文档结论

这个项目不是做一个普通试妆工具，而是要做一个：

**面向女性用户的 AI 个性化变美系统**

它的核心竞争力不在“能生成妆效图”，而在：
- 懂用户脸
- 懂场景
- 懂风格
- 懂执行
- 懂购买决策
- 懂多语言与多市场本地化表达

一句话收尾：

**首页卖想象，试妆页卖确定性，教程页卖执行力，会员页卖长期省心。**

---

## 20. i18n 国际化分阶段实施路线图

### 20.0 核心原则

多语言策略的目标不是“覆盖尽可能多的国家”，而是优先吸引 **高美妆消费能力、高订阅接受度、高 SEO 商业价值** 的用户。

目标市场优先级：**北美英语市场为核心，西欧高消费市场为第一扩张梯队，日韩成熟美妆市场为第二增长曲线，台湾/香港/新加坡高消费华语用户为补充**。

i18n 不是 Phase 3 的“锦上添花”，而应在 **MVP 架构层面预埋**，避免后续全面返工。但语言内容的实际翻译和本地化，应按市场 ROI 分阶段交付。

#### 本地化原则：不是英文硬翻译

多语言版本不得采用“英文文案逐句翻译”的方式交付。每个语言站都必须被视为一个独立的产品表面，围绕当地用户的语言习惯、搜索习惯、审美表达、信任诉求、付费心理和内容消费方式重写。

必须满足以下原则：

- **用户语言习惯优先**：标题、CTA、妆容名称、教程表达应像当地真实美妆内容创作者会说的话，而不是英语句式的翻译腔。
- **搜索意图本地化**：关键词不是翻译英文关键词，而是重新研究当地用户实际搜索词，例如日本用户更可能搜索“似合うメイク”“パーソナルカラー”，德国用户更重视“KI Make-up Test”“Make-up Beratung”。
- **妆容审美本地化**：同一个 `clean girl makeup` 在法国、日本、韩国、繁中语境下的表达重点不同，不能共用同一套概念解释。
- **信任因素本地化**：德国站强调隐私、安全、数据删除；日本站强调细节、自然、适合自己；法国站强调高级、自然、审美品味；韩国站强调皮肤质感、氛围感、个人色彩；繁中站强调适合我、少踩雷、方便执行。
- **SEO 内容独立成稿**：每个语言页面必须有本地化标题、H1、meta description、首屏直接回答、FAQ、内部链接与结构化数据，不允许只替换语言包生成近似模板页。
- **证据等级标注**：涉及搜索政策、爬虫、索引、隐私、支付、当地市场数据时，需区分官方来源、产品文档、权威报道、社区信号、推断和未验证判断。

#### 多语言选择标准

| 维度 | 判断标准 |
|------|----------|
| **消费能力** | 美妆客单价、线上购物能力、订阅制接受度 |
| **SEO 价值** | 美妆关键词搜索量、竞争强度、长尾机会 |
| **产品契合度** | 用户是否需要“适合自己的妆容/色彩/教程” |
| **变现路径** | Stripe 订阅、Affiliate、当地电商生态是否成熟 |
| **本地化成本** | 翻译、图片、支付、合规、文化适配难度 |

---

### 20.1 推荐语言总表

第一阶段商业化建议最多覆盖 **6 种语言**：

1. **English (en)** — 默认主站，覆盖美国、英国、加拿大、澳大利亚、新加坡等高消费英语用户
2. **Deutsch (de)** — 德国、奥地利、瑞士德语区；高消费、重隐私、订阅接受度好
3. **Français (fr)** — 法国、比利时、瑞士法语区、魁北克；美妆文化强，适合法式高级感定位
4. **日本語 (ja)** — 日本；美妆消费强，个人色彩、垢抜け、教程型内容需求高
5. **한국어 (ko)** — 韩国；K-beauty 影响力强，用户对风格/氛围/皮肤质感敏感
6. **繁體中文 (zh-TW)** — 台湾、香港、新加坡及海外高消费华语用户

#### 各语言本地化表达要求

| 语言 | 不应硬翻译的点 | 本地化表达方向 | 内容语气 |
|------|----------------|----------------|----------|
| **en** | 不做泛泛“AI beauty”堆词 | `AI makeup try-on`、`shade match`、`personalized tutorial`、`before/after` | 直接、自信、转化导向 |
| **de** | 不照搬英语夸张营销语 | `KI Make-up Test`、`Make-up Beratung`、`Datenschutz`、`passende Lippenstiftfarben` | 理性、可信、重隐私 |
| **fr** | 不把法式审美翻成普通“beautiful makeup” | `maquillage naturel`、`maquillage élégant`、`teint lumineux`、`rouge à lèvres adapté` | 精致、审美化、少硬卖 |
| **ja** | 不用英语句式直译日语 | `似合うメイク`、`パーソナルカラー`、`垢抜けメイク`、`ナチュラルメイク` | 细致、温和、步骤清楚 |
| **ko** | 不把 K-beauty 只翻成“韩式妆容” | `퍼스널컬러`、`데일리 메이크업`、`글로우 메이크업`、`쿨톤/웜톤 립` | 趋势感、氛围感、视觉导向 |
| **zh-TW** | 不使用大陆简中营销腔 | `AI 妝容診斷`、`個人色彩`、`適合我的口紅`、`通勤妝`、`約會妝` | 亲切、实用、少踩雷 |

#### 页面级本地化最低标准

每个新增语言页面上线前，必须完成：

- **重新写标题**：不是英文标题翻译，而是符合当地搜索表达的标题。
- **重新写 H1**：H1 需直接对应当地用户的任务或困惑。
- **重新写首屏文案**：首屏必须让当地用户知道“这页能帮我完成什么”。
- **重新写 CTA**：CTA 需符合当地转化语气，不一定都使用 `Start Your Try-On` 的对应翻译。
- **重新写 FAQ**：FAQ 来自当地用户真实疑问，而不是英文 FAQ 的逐句翻译。
- **重做内部链接锚文本**：锚文本应使用当地用户自然会点击的表达。
- **检查当地敏感点**：隐私、照片上传、AI 建议、产品推荐、付费订阅等表达不能造成误解。

#### 不建议第一批投入的语言

| 语言 | 不优先原因 | 建议阶段 |
|------|------------|----------|
| **简体中文 zh-CN** | 支付、访问、社媒渠道、内容平台竞争、合规链路复杂 | 独立商业策略后再考虑 |
| **西班牙语 es** | 流量大但 ARPU 分化明显，拉美订阅转化不稳定 | Phase 4 |
| **意大利语 it** | 美妆审美强，但市场规模小于德/法/日 | Phase 4 |
| **阿拉伯语 ar** | GCC 高消费潜力强，但 RTL、文化、图片和合规适配成本高 | Phase 4 专项 |

---

### 20.2 Phase 1 — Soft Launch / MVP 验证期（英文单语言）

**所属阶段**：MVP 核心闭环上线与 soft launch。

**目标**：先用英文跑通 `SEO → Try-On → Tutorial → Membership` 的转化链路，不急于多语言铺开。

#### 目标市场

- 美国
- 加拿大
- 英国
- 澳大利亚
- 新西兰
- 新加坡英语用户
- 欧洲英语搜索用户

#### 产出

- **UI 语言**：全站英文，根目录作为默认主站，不强制使用 `/en/`
- **架构预埋**：
  - 所有用户可见文案抽为独立的 `locales/en.json` 语言包，组件逐步减少硬编码文案
  - URL 结构预留 `/{locale}/` 前缀能力，但英文主站优先使用根路径
  - `<html lang>` 和 `hreflang` 标签预留
  - Astro 的 `getStaticPaths()` 中预留多语言路由生成逻辑
  - 图片资产按 `public/images/global/` 与未来 `public/images/{locale}/` 的思路组织
- **图片策略**：首页图片使用全球化多元肤色分布（参见 §10），不需要按语言区分
- **SEO**：优先建立 30-50 个英文 SEO 页面，包括风格页、场景页、口红色号页、教程页

#### 不做

- 不翻译内容到其他语言
- 不做语言切换器 UI
- 不做本地化妆感/人物差异化
- 不在转化漏斗未验证前扩张太多语言

---

### 20.3 Phase 2 — 高消费市场第一扩张（+3 语言）

**所属阶段**：英文站完成软启动，开始出现自然搜索、注册、试妆、会员转化数据后。

**目标**：优先进入高消费、高订阅接受度、SEO 竞争相对可控的市场。

#### 新增语言（按优先级排序）

1. **德语 (de)** — 德国、奥地利、瑞士德语区
2. **法语 (fr)** — 法国、比利时、瑞士法语区、加拿大魁北克
3. **日语 (ja)** — 日本

#### 市场定位

| 语言 | 主打卖点 | SEO 方向 |
|------|----------|----------|
| **de** | 隐私、安全、专业诊断、少踩雷 | KI Make-up Test、Make-up Beratung、Lippenstift Farben |
| **fr** | 高级、自然、法式精致、个人化色彩 | maquillage naturel、maquillage clean girl、rouge à lèvres peau claire |
| **ja** | 似合うメイク、パーソナルカラー、垢抜け、教程细节 | AIメイク診断、パーソナルカラー、ナチュラルメイク、オフィスメイク |

#### 产出

- `locales/{de,fr,ja}.json` 语言包
- 语言切换器 UI（导航栏或 Footer）
- 各语言 URL 路由：
  - `/de/`
  - `/fr/`
  - `/ja/`
- `hreflang` 互指 + 多语言 sitemap
- 各语言 SEO meta、标题、风格页、场景页、口红色号页本地化
- 首页图片轻量本地化：
  - 德语/法语站：维持全球化多元肤色分布
  - 日语站：东亚面孔占比提高，但仍保留多元形象

#### 本地化深度

- UI 文案：专业翻译，不使用机器直译
- 妆容名称：本地审美表达
- SEO slug：使用稳定、技术友好的拉丁字符 slug；日语页面可用日文标题 + 英文/罗马字 URL
- 产品 SKU 推荐：按当地可购买渠道逐步调整

---

### 20.4 Phase 3 — 亚洲高美妆消费市场扩张（+2 语言）

**所属阶段**：Phase 2 至少 1-2 个语言站出现稳定 SEO 流量或订阅转化后。

**目标**：进入亚洲高美妆消费用户圈层，强化 K-beauty 与高消费华语用户覆盖。

#### 新增语言

1. **韩语 (ko)** — 韩国
2. **繁体中文 (zh-TW)** — 台湾、香港、新加坡及海外高消费华语用户

#### 市场定位

| 语言 | 主打卖点 | SEO 方向 |
|------|----------|----------|
| **ko** | K-beauty、氛围感、皮肤质感、쿨톤/웜톤 | AI 메이크업 진단、퍼스널컬러、데일리 메이크업、글로우 메이크업 |
| **zh-TW** | AI 妝容診斷、個人色彩、適合我的口紅、通勤/約會/高級感妝容 | AI 妝容診斷、個人色彩、口紅推薦、通勤妝、約會妝 |

#### 为什么先做繁中而不是简中

- 台湾、香港、新加坡用户更容易使用 Stripe、Google 登录、海外 SaaS 订阅
- 美妆内容消费强，且对海外产品接受度更高
- 简中市场需要单独处理支付、访问、合规、渠道和内容生态，不适合并入普通 i18n 扩张

#### 产出

- `locales/{ko,zh-TW}.json` 语言包
- `/ko/`、`/zh-tw/` 路由
- 韩语/繁中 SEO 页面本地化
- 亚洲站图片人物比例微调
- 韩语站可优先强化 `glass skin`、`glow makeup`、`personal color` 内容
- 繁中站可优先强化“個人色彩”“適合我的口紅”“通勤妝”“約會妝”

---

### 20.5 Phase 4 — 大流量与高难度市场补充

**所属阶段**：核心 6 语言已形成稳定 SEO 内容资产，并且订阅收入能覆盖本地化成本后。

#### 可选语言

1. **西班牙语 (es)** — 西班牙优先，其次再考虑拉美
2. **意大利语 (it)** — 适合时尚、美妆、穿搭联动后进入
3. **阿拉伯语 (ar)** — GCC 高消费专项市场，需要 RTL、文化、图片和合规适配
4. **简体中文 (zh-CN)** — 仅在有独立运营、支付、访问、社媒和合规方案后考虑

#### 特殊注意事项

- **西语站**：需区分欧洲西语与拉美西语，避免一个版本同时服务所有市场导致转化效率低
- **阿语站**：需要 RTL (Right-to-Left) CSS 布局适配，图片和妆容表达需文化审查
- **简中站**：可能需要独立部署、独立支付、独立内容分发策略，不应简单复制国际站

---

### 20.6 技术架构要求总结

| 层级 | Phase 1 预埋 | Phase 2 实施 | Phase 3 扩展 | Phase 4 专项 |
|------|-------------|-------------|-------------|-------------|
| **文案系统** | `locales/en.json` | `de/fr/ja` 语言包 | `ko/zh-TW` 语言包 | `es/it/ar/zh-CN` 视 ROI 增加 |
| **路由** | 英文根路径 + locale 前缀预留 | `/de/` `/fr/` `/ja/` | `/ko/` `/zh-tw/` | 独立语言路径或专项站 |
| **SEO** | 英文 canonical + meta | hreflang + 多语言 sitemap | 亚洲关键词本地化 | 独立 SEO 策略 |
| **图片** | 全球化多元图片池 | 欧洲/日本轻量微调 | 亚洲站人物比例微调 | 完全本地化图片组 |
| **布局** | LTR only | LTR only | LTR only | LTR + RTL (ar) |
| **支付** | Stripe 国际 | Stripe 国际 | Stripe 国际 | 视国家加入本地支付 |
| **部署** | Cloudflare 单站 | 单站多语言 | 单站多语言 | 中国/阿语可能专项部署 |

---

### 20.7 多语言 SEO 与索引验收标准

多语言页面上线前，不能只检查源码或语言包是否存在，必须检查最终构建后的搜索可见表面，包括生成 HTML、路由、sitemap、robots.txt、canonical、hreflang、结构化数据、可见正文和内部链接。

#### 四个审核视角

| 视角 | 核心问题 | 验收重点 |
|------|----------|----------|
| **用户体验与任务完成** | 当地用户能否快速、安全地完成试妆、找色号、学教程、订阅？ | 首屏清晰、CTA 自然、流程可完成、隐私边界明确 |
| **Google 抓取与索引表面** | Googlebot 能否发现、抓取、理解正确 canonical 页面？ | sitemap、robots、canonical、hreflang、状态码、结构化数据 |
| **产品与信息架构** | 多语言站是否像一个连贯产品，而不是翻译页面集合？ | 导航、Hub、相关链接、会员路径、信任页面一致 |
| **SEO 与有用内容** | 页面是否满足真实搜索意图，并提供信息增益？ | 独特标题、直接答案、决策表、清单、FAQ、非模板化正文 |

#### 多语言 URL 进入 sitemap 的准入规则

一个多语言 URL 只有满足以下条件，才允许进入可索引 sitemap：

- 有一个明确的搜索意图或用户任务。
- 有唯一的 title、meta description、H1、首屏直接回答和正文结构。
- 有信息增益，例如对比矩阵、步骤清单、决策树、注意事项、当地表达解释、用户下一步建议。
- 从导航、语言 Hub、相关页面或 footer 中至少获得一个描述性内部链接。
- self-canonical 正确，无误设 `noindex`，无重定向/canonical 不一致问题。
- 不是工具参数页、标签页、筛选页、法律页、占位页、薄内容模板页或重复变体页。

#### GSC 非索引诊断规则

如果 Google Search Console 出现 `Discovered - currently not indexed`：

- 优先检查该语言 URL 是否只存在于 sitemap、是否缺少内部链接。
- 检查 sitemap 是否包含过多低价值 URL，稀释抓取优先级。
- 检查 robots.txt、canonical host、尾斜杠策略、HTTP 状态码和重定向链。
- 优先合并薄页面，不要继续批量发布近似模板页。

如果 Google Search Console 出现 `Crawled - currently not indexed`：

- 检查最终渲染 HTML，而不是只看源数据。
- 对比 title、description、H1、首屏回答和正文是否真正满足当地搜索意图。
- 检查是否存在近重复页面、模板化正文、样板内容比例过高、页面信息增益不足。
- 如果页面确实没有独立价值，应合并或 `noindex,follow`，而不是强行提交 sitemap。

#### 多语言内容质量禁区

禁止以下做法：

- 关键词堆砌。
- 假装内容有“最新更新”但实际无实质变化。
- 为每个关键词批量生成门页。
- 只替换语言包但正文结构和信息完全相同。
- 对 AI 诊断、美妆效果、订阅收益作出无法证明的承诺。
- 把 sitemap 提交当成收录保证。

#### 验证流程

每次新增语言站或大批量语言页面后，必须验证：

- `npm.cmd run build`
- 最终 HTML 中的 `<title>`、`meta description`、`canonical`、`hreflang`、`<h1>` 是否正确。
- `dist/robots.txt` 与 sitemap index 是否存在且可读。
- sitemap URL 是否均为可索引页面。
- 页面是否存在 sitemap/noindex 冲突。
- JSON-LD 是否可解析。
- 主要页面是否有内部入口。
- 多语言页面之间是否 `hreflang` 互指。
- 是否存在重复 title/description、低正文长度、弱内部链接或高相似度页面。

如项目中没有索引审计脚本，应新增 `audit:indexing` 脚本，用于检查 sitemap URL、lastmod 覆盖、noindex/sitemap 冲突、canonical 精确匹配、H1 数量、JSON-LD 可解析性、本地链接/资源断链、重复标题/描述、低内部链接和高正文相似度。

---

### 20.8 与 §16.6 的关系

§16.6 建议“先做重点市场，不要一次铺太大”——本节将该建议落实为以高消费订阅用户为核心的四阶段计划：

- Phase 1：英文 MVP（1 语言 + 架构预埋）
- Phase 2：德语、法语、日语（西欧高消费 + 日本美妆成熟市场）
- Phase 3：韩语、繁体中文（K-beauty + 高消费华语用户）
- Phase 4：西语、意大利语、阿语、简中等专项市场

**关键：第一阶段商业化上限建议为 6 种语言。** 在英文站转化漏斗没有跑通之前，不应一次性扩张 10 种语言；否则会分散 SEO、翻译、图片、本地化、客服、支付与运营资源。

最终推荐顺序：

`English → German → French → Japanese → Korean → Traditional Chinese`
