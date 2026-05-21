# AI Beauty Stylist MVP TODOs

## 当前阶段判断

- **当前阶段**：前端 MVP / 可演示核心闭环
- **整体完成度**：约 `45%-55%`
- **前端体验层完成度**：约 `65%-75%`
- **当前不属于**：全栈 MVP、接近上线

项目已经从“PRD + 静态原型”推进到“**可运行、可演示、可继续扩展的 Astro 前端工程**”，但真实后端、数据库、存储、支付、鉴权和 AI 服务仍未接入。

---

## 已完成（按模块）

### 1. 工程与基础设施骨架

- [x] `Astro + Cloudflare` 工程底座
- [x] `package.json` / `astro.config.mjs` / `tsconfig.json` 基础配置
- [x] 本地开发与构建链路可用
- [x] 统一布局、全局样式、组件化目录结构

### 2. 页面与核心体验流

- [x] 首页 `index.astro`
- [x] `Try On` 主流程页
- [x] `Shade Finder` 微工具页
- [x] `Tutorial` 教程页
- [x] `Membership` 会员页雏形
- [x] 首页 CTA 与导航已切到 `Try On`

### 3. MVP 演示能力

- [x] 上传图片本地预览
- [x] mock 诊断结果
- [x] 3 套妆容方案切换
- [x] 方案卡展示适合原因 / 场景 / 难度 / 时间 / 重点区域
- [x] 教程页展示步骤拆解
- [x] 教程页展示错误提醒 / 自检点
- [x] SKU 级工具包展示（必备 / 可替代 / 预算升级）
- [x] 分享卡 mock 与复制文案入口

### 4. 数据与接口（当前仍为 mock）

- [x] `api/shade-diagnosis.ts`
- [x] `api/try-on-plan.ts`
- [x] `mockTryOn.ts` 统一承载 look / step / SKU / 分享卡数据

---

## 还没完成（当前阻塞“全栈 MVP / 上线”）

### 1. 真实服务层

- [ ] 拆出真正的 `Cloudflare Workers API` 分层
- [ ] 页面层与 mock 数据层彻底解耦
- [ ] 增加运行环境配置与部署配置（如 `wrangler`）

### 2. 数据库与存储

- [x] 设计 `D1` 表结构
- [x] 编写初版建表 SQL
- [ ] 接入 `R2` 处理上传图片 / 素材存储
- [x] 设计 `tryon_jobs` / `saved_looks` / `users` / `subscriptions` 数据模型

### 3. 真实 AI 能力

- [ ] 接自拍上传后的真实分析链路
- [ ] 接外部图像分析 / 生成模型 API
- [ ] 处理任务状态、错误重试、超时与失败回退

### 4. 商业化能力

- [ ] 重写 `membership` 页，使其更贴近 PRD 的权益设计
- [ ] 接 `Auth` / 登录态 / 权限控制
- [ ] 接 `Stripe` 订阅与支付
- [ ] 接使用额度、会员权益与结果解锁逻辑

### 5. 增长与 SEO

- [ ] 扩更多微工具页
- [ ] 做场景页集群（Office / Date / Bridal / Interview）
- [ ] 做关键词落地页模板
- [ ] 做多语言 SEO 结构
- [ ] 接 Affiliate SKU 跳转与佣金链路

---

## 建议下一阶段优先级

### P0：下一批必须先做的（建议直接开做）

- [ ] **拆 API 边界**：把当前页面直接消费 mock 的方式，过渡为“页面 → API / service → data provider”
- [ ] **设计 D1 表结构**：至少先产出 `users`、`subscriptions`、`tryon_jobs`、`saved_looks` 的字段定义
- [ ] **补部署配置**：增加 `wrangler` 配置和环境变量约定，为后面接 `D1 / R2 / KV` 做准备

### P1：紧接着做的

- [ ] **上传链路抽象**：先做本地 mock / 将来切换 `R2` 的统一接口
- [ ] **AI provider 抽象层**：先留模型适配接口，后续替换为真实服务
- [ ] **会员页重构**：把免费版 / 会员版 / 订阅权益与升级时机重新整理到位

### P2：之后做的

- [ ] **Auth 接入**
- [ ] **Stripe 接入**
- [ ] **保存历史记录 / 收藏妆容 / 结果回看**
- [ ] **分享卡真实导出（截图 / 图片生成）**

### P3：增长层

- [ ] **场景 SEO 页模板化**
- [ ] **关键词落地页批量生成策略**
- [ ] **Affiliate 商品推荐链路**

---

## 推荐的下一轮开发 Batch

### Batch 3（已完成）

- [x] 新增 `wrangler` 配置与环境变量约定
- [x] 新建 `D1` 数据模型文档或 SQL 初稿
- [x] 抽 `Try On` 的 service / repository / provider 边界
- [x] 重写 `membership` 页文案与升级权益结构

### Batch 4（下一步）

- [ ] 抽上传链路接口，为后续接 `R2` 做 provider 切换准备
- [ ] 把 `Try On` mock provider 替换为真正的 Workers/AI job 调度入口
- [ ] 接 `Auth` 与会员权限控制
- [ ] 接 `Stripe` 和结果解锁逻辑

项目已经从“**前端可演示 MVP**”正式推进到“**全栈 MVP 准备阶段**”。
