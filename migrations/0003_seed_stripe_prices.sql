-- ============================================================
-- Migration 0003: 回填 Stripe Price IDs 到 plans 表
-- 由 Stripe CLI 在 aibeautystylist 沙盒账户创建后获得
-- 同时更新定价（Pro/Premium 双倍上调，参考真人造型师定价锚点）
-- ============================================================

-- ─── Pro Monthly ($19.99) ────────────────────────────────────
UPDATE plans
SET stripe_price_id = 'price_1Ta7mvBEosBexblf4VoiKZgr',
    price_cents = 1999
WHERE id = 'pro_monthly';

-- ─── Pro Yearly ($149/yr) ────────────────────────────────────
UPDATE plans
SET stripe_price_id = 'price_1Ta7n4BEosBexblftIGPojm1',
    price_cents = 14900
WHERE id = 'pro_yearly';

-- ─── Premium Monthly ($39.99) ────────────────────────────────
UPDATE plans
SET stripe_price_id = 'price_1Ta7n5BEosBexblfWSYGnE5n',
    price_cents = 3999
WHERE id = 'premium_monthly';

-- ─── Premium Yearly ($299/yr) ────────────────────────────────
UPDATE plans
SET stripe_price_id = 'price_1Ta7n6BEosBexblfGENQoa5V',
    price_cents = 29900
WHERE id = 'premium_yearly';

-- ─── Single Occasion Pack ($9.99 一次性) ─────────────────────
INSERT OR IGNORE INTO plans (id, name, tier, interval, price_cents, currency, stripe_price_id, features_json, sort_order) VALUES
  ('single_occasion', 'Single Occasion Pack', 'pro', NULL, 999, 'usd',
   'price_1Ta7mfBEosBexblfGvHtakBR',
   '{"diagnosisLimit":3,"looksLimit":3,"tutorialDetail":"full","makeupPreview":true,"makeupPreviewQuality":"standard","kitRecommend":"full","historyDays":7,"savedLooksLimit":1}',
   5);

-- 如果 single_occasion 已经存在（重复执行此 migration），更新 stripe_price_id
UPDATE plans
SET stripe_price_id = 'price_1Ta7mfBEosBexblfGvHtakBR'
WHERE id = 'single_occasion' AND (stripe_price_id IS NULL OR stripe_price_id = '');
