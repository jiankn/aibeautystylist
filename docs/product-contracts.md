# AI Beauty Stylist 产品与技术契约

> 版本：2026-06-07  
> 首发语言：简体中文  
> 适用范围：根目录 8 个核心页面及其支持 API

## 1. 用户状态机

| 状态 | 判定条件 | 可执行主行动 | 页面表现 |
|---|---|---|---|
| `guest` | 无有效会话 | 浏览、选择妆容、开始试妆 | 上传前引导登录或建立匿名会话 |
| `free_ready` | Free 用户且额度大于 0 | 上传自拍并生成 | 显示剩余额度和分享规则 |
| `free_generated` | Free 用户已有成功结果 | 分享、继续试妆、升级 | 展示结果限制和自然升级入口 |
| `free_exhausted` | Free 基础额度与奖励额度均为 0 | 分享换额度或升级 | 禁止创建新任务，仍可查看已有结果 |
| `pro_active` | Pro 订阅有效 | 完整教程、保存、高清下载 | 显示当前计划和 70 次月额度 |
| `premium_active` | Premium 订阅有效 | 优先生成、长期历史、完整妆容库 | 显示当前计划和 150 次月额度 |
| `subscription_grace` | 已取消但计费周期未结束 | 继续使用当前权益 | 显示到期日期和管理订阅 |
| `subscription_expired` | 订阅已到期 | 查看历史、升级 | 禁止创建付费等级任务 |
| `job_running` | 存在当前生成任务 | 查看进度、取消 | 禁止重复提交同一请求 |
| `job_failed` | 任务失败 | 查看原因、重试 | 明确说明额度未扣或已返还 |

状态优先级：

1. 任务运行/失败状态覆盖页面局部交互状态。
2. 订阅有效状态由服务端数据库和 Stripe Webhook 同步结果判定。
3. 页面不得仅根据 URL、前端变量或按钮可见性判断权限。

## 2. 额度规则

额度统一称为“生成额度”。AI 面容诊断和 AI 试妆都属于生成任务，均使用同一套月度额度；当前版本不设置独立的“诊断额度”。

| 计划 | 月基础额度 | 分享奖励 | 月度刷新 |
|---|---:|---:|---|
| Free | 3 | 每个 UTC 自然日最多 1 次 | 每月 1 日 UTC 00:00 |
| Pro | 70 | 无 | 每个订阅周期 |
| Premium | 150 | 无 | 每个订阅周期 |

规则：

- 只有服务端成功创建唯一任务后才预占 1 次额度。
- 成功任务将预占记录结算为已消费。
- 失败、超时或取消任务自动返还预占额度。
- `idempotencyKey` 相同的请求只能创建一个任务并扣减一次。
- 分享奖励按 `userId + UTC 日期 + rewardType` 保证幂等。
- 额度账目以不可变 `usage_records` 流水为准，不直接覆盖历史记录。

## 3. 任务状态

`created -> upload_validating -> diagnosis_running -> image_running -> succeeded`

异常分支：

- 任意运行状态可以进入 `failed`。
- 用户主动取消可以进入 `cancelled`。
- 超过服务端超时时间（当前 90 秒）进入 `timed_out`，随后自动返还额度。
- 重试必须创建新的任务 ID，并关联 `retryOfJobId`。

## 4. 核心事件契约

所有事件共有属性：

- `eventId`
- `occurredAt`
- `sessionId`
- `userId` 或匿名 `visitorId`
- `locale`
- `page`
- `source`
- `plan`

| 事件 | 触发时机 | 关键属性 |
|---|---|---|
| `home_start_tryon_click` | 首页主 CTA 点击 | `placement` |
| `discover_filter_apply` | 筛选条件生效 | `scenario`、`finish`、`experience`、`resultCount` |
| `look_selected` | 用户选择妆容 | `lookSlug`、`scenario`、`placement` |
| `photo_consent_accepted` | 用户主动勾选并确认上传同意 | `consentVersion` |
| `photo_upload_success` | 服务端完成文件校验与私有存储 | `fileType`、`fileSizeBucket` |
| `diagnosis_generated` | 结构化诊断成功 | `jobId`、`confidenceBand`、`durationMs` |
| `tryon_generated` | 妆效图成功 | `jobId`、`lookSlug`、`durationMs` |
| `share_card_created` | 分享卡成功生成 | `jobId`、`lookSlug` |
| `share_completed` | Web Share 完成或分享动作确认 | `platform`、`rewardGranted` |
| `pricing_viewed` | 价格页可见 | `source`、`currentPlan` |
| `checkout_started` | 服务端成功创建 Checkout Session | `targetPlan`、`billingInterval` |
| `subscription_activated` | Webhook 确认订阅有效 | `targetPlan`、`billingInterval` |

禁止记录：

- 原始自拍内容、base64、可识别面部特征向量。
- API 密钥、OAuth secret、Stripe secret。
- 无业务必要性的精确个人身份信息。

## 5. API 契约

统一响应：

```json
{
  "ok": true,
  "data": {},
  "requestId": "req_xxx"
}
```

统一错误：

```json
{
  "ok": false,
  "error": {
    "code": "QUOTA_EXHAUSTED",
    "message": "本月生成额度已用完",
    "retryable": false
  },
  "requestId": "req_xxx"
}
```

核心端点：

| 方法与路径 | 用途 | 权限与关键规则 |
|---|---|---|
| `GET /api/session` | 当前用户、计划和额度 | 允许匿名会话 |
| `POST /api/consents/photo` | 写入照片处理显式同意 | 必须带同意版本 |
| `POST /api/uploads` | 校验并私有上传自拍 | 必须先有有效同意 |
| `DELETE /api/uploads/:id` | 删除原图 | 仅资源所有者 |
| `POST /api/internal/cleanup/uploads` | 清理过期原图并记录审计 | 仅持有 `CLEANUP_SECRET` 的内部调度任务 |
| `POST /api/tryon-jobs` | 创建诊断与试妆任务 | 权限、额度、幂等校验 |
| `GET /api/tryon-jobs/:id` | 查询任务状态和结果 | 仅资源所有者 |
| `GET /api/tryon-jobs/:id/result` | 读取私有 AI 妆效结果图 | 仅资源所有者，静态参考图不走此接口 |
| `POST /api/tryon-jobs/:id/cancel` | 取消运行中任务 | 仅资源所有者 |
| `POST /api/tryon-jobs/:id/retry` | 重试失败任务 | 创建新任务并关联旧任务 |
| `DELETE /api/tryon-jobs/:id` | 删除结果与诊断 | 仅资源所有者 |
| `GET /api/looks` | 获取妆容 catalog | 可公开读取 |
| `POST /api/share-cards` | 创建分享卡 | 必须拥有成功结果 |
| `POST /api/share-rewards` | 发放分享奖励 | Free 用户、每日幂等 |
| `POST /api/stripe/checkout` | 创建 Checkout | 登录用户 |
| `POST /api/stripe/portal` | 创建客户 Portal | 有 Stripe customer |
| `POST /api/stripe/webhook` | 同步订阅状态 | 验证 Stripe 签名 |
| `DELETE /api/me/data` | 删除用户图片与诊断数据 | 二次确认后执行 |

## 6. 错误码

| 错误码 | HTTP | 是否可重试 | 用户反馈 |
|---|---:|---|---|
| `AUTH_REQUIRED` | 401 | 否 | 请先登录 |
| `FORBIDDEN` | 403 | 否 | 当前计划不支持此功能 |
| `CONSENT_REQUIRED` | 409 | 否 | 上传前请先确认照片处理说明 |
| `INVALID_IMAGE` | 422 | 否 | 请上传符合要求的 JPG 或 PNG |
| `QUOTA_EXHAUSTED` | 409 | 否 | 本月额度已用完，可分享或升级 |
| `JOB_ALREADY_EXISTS` | 409 | 否 | 已有相同任务正在处理 |
| `JOB_NOT_FOUND` | 404 | 否 | 没有找到该任务 |
| `JOB_NOT_CANCELLABLE` | 409 | 否 | 当前任务状态不能取消 |
| `JOB_NOT_RETRYABLE` | 409 | 否 | 仅失败、取消或超时任务可以重试 |
| `AI_TIMEOUT` | 504 | 是 | 生成超时，额度已返还，可重试 |
| `AI_UNAVAILABLE` | 503 | 是 | 服务暂时不可用，额度已返还 |
| `LOW_CONFIDENCE` | 200 | 否 | 结果仅供参考，并展示低置信度说明 |
| `PAYMENT_STATE_PENDING` | 409 | 是 | 支付状态正在同步 |
| `RATE_LIMITED` | 429 | 是 | 请求过于频繁，请稍后再试 |

## 7. 数据模型

| 表 | 关键字段 |
|---|---|
| `users` | `id`、`email`、`createdAt`、`deletedAt` |
| `plans` | `id`、`code`、`monthlyQuota`、`featuresJson` |
| `subscriptions` | `id`、`userId`、`stripeSubscriptionId`、`planCode`、`status`、`currentPeriodEnd` |
| `usage_records` | `id`、`userId`、`jobId`、`type`、`amount`、`idempotencyKey`、`occurredAt` |
| `photo_consents` | `id`、`userId`、`version`、`acceptedAt`、`revokedAt` |
| `uploads` | `id`、`userId`、`r2Key`、`status`、`contentType`、`sizeBytes`、`width`、`height`、`orientation`、`deleteAfter`、`deletedAt` |
| `tryon_jobs` | `id`、`userId`、`uploadId`、`lookSlug`、`status`、`confidence`、`idempotencyKey`、`retryOfJobId`、`resultJson`、`resultR2Key`、`errorCode`、`completedAt`、`deletedAt` |
| `diagnoses` | `id`、`jobId`、`resultJson`、`createdAt` |
| `saved_looks` | `id`、`userId`、`jobId`、`lookSlug`、`createdAt` |
| `tutorials` | `id`、`jobId`、`stepsJson`、`version` |
| `recommended_kits` | `id`、`jobId`、`budgetTier`、`itemsJson` |
| `share_cards` | `id`、`userId`、`jobId`、`r2Key`、`sourceCode` |
| `locale_preferences` | `userId`、`locale`、`updatedAt` |
| `deletion_audit_records` | `userId`、`resourceType`、`resourceId`、`r2Key`、`actor`、`status`、`errorCode`、`createdAt` |
| `ai_call_logs` | `id`、`userId`、`jobId`、`provider`、`operation`、`model`、`status`、`durationMs`、`promptTokens`、`outputTokens`、`totalTokens`、`estimatedCostMicros`、`errorCode`、`createdAt` |

诊断结构使用版本化固定 schema：`schemaVersion`、`confidence`、`skinTone`、`faceShape`、`eyeShape`、`colorSeason`、`strengths`、`cautions`、`makeupDirections` 和产品固定免责声明。Provider 返回必须经过应用侧语义校验，不能直接信任模型 JSON。

索引与唯一约束：

- `usage_records.idempotencyKey` 唯一。
- `tryon_jobs.idempotencyKey` 唯一。
- `subscriptions.stripeSubscriptionId` 唯一。
- 分享奖励对 `userId + rewardDate + type` 唯一。
- 所有用户资源表按 `userId` 建索引。

## 8. R2 文件生命周期

| 对象 | 默认访问 | 生命周期 |
|---|---|---|
| 原始自拍 | 私有，使用 `originals/` 对象前缀 | 诊断完成后尽快删除，R2 生命周期保证最长不超过 30 天 |
| 妆效结果图 | 私有 | 用户删除或账户删除时删除 |
| 分享卡 | 可撤销的公开链接 | 用户删除结果或分享卡时删除 |
| 静态妆容素材 | 公开 | 随版本发布长期保留 |

要求：

- 前端不得获得永久 R2 私有对象 URL。
- 私有图片只通过短期签名 URL 或授权 API 读取。
- 删除操作写入审计记录，并异步重试失败的对象删除。
- 过期原图由 `POST /api/internal/cleanup/uploads` 清理，调用方必须持有 `CLEANUP_SECRET`。
- 删除试妆结果时，仅删除 `resultR2Key` 明确指向的私有对象；静态参考图不属于用户结果对象。
- 删除试妆结果时同步清理诊断、教程、推荐、收藏和分享记录；额度流水保留为计费审计。

## 9. 上线验收契约

- 上传至结果成功率不低于 95%。
- P95 首个结果等待时间不高于 45 秒。
- 任务失败、取消和超时均自动返还额度。
- 用户可删除原图、结果图和诊断记录。
- Pro/Premium 权限必须经过服务端校验。
- 8 个核心页面在 375px、768px、1440px 无横向溢出。
- 关键按钮支持键盘操作，文字与背景满足 WCAG 2.1 AA。
