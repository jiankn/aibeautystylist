# 一次性额度包落地方案

## 1. 产品目标

为仍处于有效订阅周期的 Pro、Premium 用户提供不中断当前任务的恢复路径。额度包解决短期峰值需求，不替代套餐升级，也不向 Free 用户销售。

## 2. 首发规格与定价

| 额度包 | 售价 | 单次价格 | 定位 |
|---|---:|---:|---|
| 20 次应急包 | US$7.99 | US$0.40 | 活动、拍摄或临时补量 |
| 60 次畅用包 | US$18.99 | US$0.32 | 短期高频使用，主推 |

定价依据：

- Pro 为 US$19.99 / 70 次，约 US$0.29 / 次。
- Premium 为 US$39.99 / 150 次，约 US$0.27 / 次。
- 额度包单次成本必须高于订阅，防止用户用小包替代长期套餐。
- 60 次包提供约 20% 的阶梯折扣，承担价格锚点和主力转化角色。
- Pro 用户购买 60 次包的总支出接近 Premium，界面仍应同时说明升级 Premium 能获得更多额度和完整权益。

## 3. 业务规则

- 仅有效 Pro、Premium 会员可购买。
- 额度购买成功后立即加入当前计费周期。
- 未使用额度在当前订阅周期续费时失效，不跨周期结转。
- 失败、超时或系统取消的生成任务仍按现有规则返还额度。
- 同一个 Stripe Checkout Session 只允许到账一次。
- 退款和争议处理首发阶段由支持团队人工审核；正式开放自动退款前需要增加额度回收流水。

## 4. 用户流程

### Pro 额度耗尽

1. 上传前识别剩余额度为 0，禁止继续选择和上传照片。
2. 展示明确的本周期耗尽状态和下次恢复日期。
3. 主动作：升级 Premium。
4. 次动作：购买额度包。
5. 支付完成后回到账户页，主动同步 Stripe Session，显示到账结果。

### Premium 额度耗尽

1. 上传前阻止无效操作。
2. 主动作：购买额度包。
3. 次动作：查看历史结果。
4. 不再展示“查看更高套餐”这种不存在的恢复路径。

### 非耗尽状态

账户订阅页持续提供额度包入口，但弱于正常生成和套餐管理，不做强弹窗。

## 5. UI/UX 规范

- 一个状态只保留一个主按钮，辅助动作使用次级按钮。
- 支付按钮点击后立即进入禁用和处理状态，避免重复创建 Checkout。
- 状态消息使用 `role="status"`，不能只靠颜色表达成功或失败。
- 触控目标不小于 44px。
- 购买卡片在 720px 以下改为单列。
- 明确展示“本计费周期有效”，避免用户误认为永久结转。

## 6. 技术实现

- Stripe Checkout Session 使用 `mode=payment`。
- Price ID 只从服务端环境变量读取，不接受客户端传入金额或 Stripe Price ID。
- Checkout metadata 包含用户、套餐、额度包和当前订阅周期。
- Webhook 与主动同步接口共用同一到账服务。
- `usage_records` 使用 `credit_pack:<userId>:<sessionId>` 作为幂等键。
- `credit_pack_orders` 保存支付订单审计记录。

需要在 Stripe 创建两个一次性 Price，并配置：

```text
STRIPE_PRICE_CREDITS_20
STRIPE_PRICE_CREDITS_60
```

Webhook 继续监听 `checkout.session.completed`。

## 7. 上线指标

- `credit_pack_panel_view`
- `credit_pack_checkout_started`
- `credit_pack_checkout_completed`
- `credit_pack_fulfillment_failed`
- `quota_exhausted_view`
- `quota_recovered_after_purchase`

核心观察：

- Pro 耗尽用户升级 Premium 与购买额度包的比例。
- Premium 耗尽后的恢复率。
- Checkout 完成率、到账延迟和重复到账率。
- 额度包收入是否侵蚀 Premium 升级收入。
- 临近续费购买后产生的退款或投诉比例。

## 8. 发布策略

1. 内部 Stripe 测试模式验证两个 Price、Webhook、重复回调与主动同步。
2. 先向 20% 的付费用户开放，观察 7 天。
3. 若 Premium 升级率明显下降，调高 60 次包价格或降低展示优先级。
4. 若大量用户在续费前 72 小时购买，下一版增加有效期提示强化或改为 30 天独立有效期账本。
