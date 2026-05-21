# AI Beauty Stylist MVP

基于 `Astro + Cloudflare` 的 AI 美妆顾问 MVP。

## 当前阶段

项目已从 PRD / 静态原型推进到 **前端 MVP / 可演示核心闭环**，并开始补齐全栈 MVP 准备层：

- 首页 / `Try On` / `Tutorial` / `Membership` / `Shade Finder`
- mock 诊断 API 与 `Try On` 主流程
- service / provider 分层骨架
- `wrangler` 配置骨架
- `D1` 初版 schema

## 当前能力

- 上传图片本地预览
- mock AI 诊断与 3 套妆容方案
- 教程步骤 / 错误提醒 / 自检点
- SKU 级工具包展示
- 分享卡 mock 与文案复制
- 更贴近 PRD 的会员价值页

## 项目结构

- `src/pages`: 页面与 API 路由
- `src/components`: 前端组件
- `src/lib/services`: service 层，供页面/API 调用
- `src/lib/providers`: provider 层，当前先接 mock，后续切真实服务
- `cloudflare/d1/schema.sql`: D1 初版建表 SQL
- `wrangler.jsonc`: Cloudflare Worker / KV / D1 / R2 配置骨架
- `.dev.vars.example`: 本地环境变量示例

## 本地开发

```bash
npm install
npm run dev
```

## Cloudflare 准备

1. 复制 `.dev.vars.example` 为 `.dev.vars`
2. 把 `wrangler.jsonc` 里的占位符替换成真实 `KV / D1 / R2` 绑定
3. 用 `cloudflare/d1/schema.sql` 初始化数据库
4. 后续把 `AI_PROVIDER` 从 `mock` 切到真实 provider

## 下一步

- 接真实上传与 `R2`
- 接外部图像分析 / 生成模型
- 接 `Auth` / `Stripe`
- 把 SEO 场景页和关键词落地页模板化
