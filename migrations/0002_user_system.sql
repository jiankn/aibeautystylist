-- ============================================================
-- Migration 0002: 用户系统与会员体系
-- PRD §14.4 要求的核心表（补全 0001_init.sql 中缺失的 7 张）
-- 目标数据库: Cloudflare D1 (SQLite)
-- ============================================================

-- ─── 1. 用户表 ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                          -- UUID
  email TEXT UNIQUE,                            -- 登录邮箱（OAuth / Magic Link）
  name TEXT,                                    -- 显示名称
  avatar_url TEXT,                              -- 头像 URL（OAuth 提供）
  auth_provider TEXT NOT NULL DEFAULT 'email',  -- 'google' | 'github' | 'email'
  auth_provider_id TEXT,                        -- OAuth provider 的用户 ID
  locale TEXT NOT NULL DEFAULT 'en',            -- 用户语言偏好 'en' | 'zh' | ...
  tier TEXT NOT NULL DEFAULT 'free',            -- 当前会员等级 'free' | 'pro' | 'premium'
  stripe_customer_id TEXT,                      -- Stripe Customer ID
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_stripe ON users (stripe_customer_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth_provider
  ON users (auth_provider, auth_provider_id);

-- ─── 2. Auth Session 表 ──────────────────────────────────────
-- 用于服务端 session 管理（KV 缓存 + D1 持久化双写）
CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,                          -- Session token (UUID)
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,                     -- ISO 8601 过期时间
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  user_agent TEXT,                              -- 登录设备信息
  ip_address TEXT                               -- 登录 IP
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON auth_sessions (expires_at);

-- ─── 3. 会员计划定义表 ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,                          -- 'free' | 'pro_monthly' | 'pro_yearly' | 'premium_monthly' | 'premium_yearly'
  name TEXT NOT NULL,                           -- 显示名称
  tier TEXT NOT NULL,                           -- 'free' | 'pro' | 'premium'
  interval TEXT,                                -- 'month' | 'year' | NULL (free)
  price_cents INTEGER NOT NULL DEFAULT 0,       -- 价格（美分）
  currency TEXT NOT NULL DEFAULT 'usd',
  stripe_price_id TEXT,                         -- Stripe Price ID
  features_json TEXT NOT NULL DEFAULT '{}',     -- JSON: 权益配置 { diagnosisLimit, looksLimit, ... }
  is_active INTEGER NOT NULL DEFAULT 1,         -- 是否可购买
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── 4. 用户订阅表 ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,                          -- UUID
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  stripe_subscription_id TEXT,                  -- Stripe Subscription ID
  status TEXT NOT NULL DEFAULT 'active',        -- 'active' | 'past_due' | 'canceled' | 'trialing'
  current_period_start TEXT,                    -- 当前计费周期开始
  current_period_end TEXT,                      -- 当前计费周期结束
  cancel_at_period_end INTEGER NOT NULL DEFAULT 0,  -- 是否到期取消
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_stripe
  ON subscriptions (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);

-- ─── 5. 用户收藏的妆容方案 ──────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_looks (
  id TEXT PRIMARY KEY,                          -- UUID
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id TEXT REFERENCES tryon_jobs(id),        -- 关联的诊断 job
  look_id TEXT NOT NULL,                        -- AI 生成的 look ID
  look_name TEXT NOT NULL,                      -- 妆容名称（冗余存储，避免 join）
  scenario TEXT,
  look_json TEXT NOT NULL,                      -- 完整 look 数据快照（JSON）
  notes TEXT,                                   -- 用户备注
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_saved_looks_user ON saved_looks (user_id, created_at);

-- ─── 6. 教程进度表 ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tutorials_progress (
  id TEXT PRIMARY KEY,                          -- UUID
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  look_id TEXT NOT NULL,                        -- 关联的妆容方案 ID
  tutorial_version TEXT NOT NULL DEFAULT 'standard', -- 'beginner' | 'standard' | 'quick'
  total_steps INTEGER NOT NULL,
  completed_steps INTEGER NOT NULL DEFAULT 0,
  current_step INTEGER NOT NULL DEFAULT 0,
  step_feedback_json TEXT DEFAULT '{}',         -- JSON: { stepIndex: 'done'|'skip'|'help' }
  completed_at TEXT,                            -- 全部完成时间
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tutorials_progress_user
  ON tutorials_progress (user_id, look_id);

-- ─── 7. 推荐工具包历史 ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS recommended_kits (
  id TEXT PRIMARY KEY,                          -- UUID
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  job_id TEXT REFERENCES tryon_jobs(id),        -- 关联的诊断 job
  look_id TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'must_have',       -- 'must_have' | 'optional' | 'upgrade'
  sku TEXT NOT NULL,                            -- 产品 SKU
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,                       -- 'foundation' | 'lipstick' | 'eyeshadow' | ...
  shade TEXT,
  price TEXT,
  affiliate_url TEXT,                           -- Affiliate 链接
  clicked_at TEXT,                              -- 用户点击时间（追踪转化）
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_recommended_kits_user ON recommended_kits (user_id);
CREATE INDEX IF NOT EXISTS idx_recommended_kits_job ON recommended_kits (job_id, look_id);
CREATE INDEX IF NOT EXISTS idx_recommended_kits_sku ON recommended_kits (sku);

-- ─── 8. 用户语言偏好表 ───────────────────────────────────────
-- 独立表便于后续 i18n 扩展（Phase 4.4）
CREATE TABLE IF NOT EXISTS locale_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  locale TEXT NOT NULL DEFAULT 'en',            -- 'en' | 'zh' | 'ja' | 'ko' | ...
  region TEXT,                                  -- 'US' | 'CN' | 'JP' | ...
  timezone TEXT,                                -- 用户时区
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── 初始计划数据 ────────────────────────────────────────────
-- 定价策略（参考真人造型师/色彩顾问而非 AR 滤镜工具）：
--   Pro $19.99/mo · $149/yr (省 38%)  — Beauty Stylist 执行教练
--   Premium $39.99/mo · $299/yr (省 38%) — 全年风格私管
INSERT OR IGNORE INTO plans (id, name, tier, interval, price_cents, currency, features_json, sort_order) VALUES
  ('free', 'Free Explorer', 'free', NULL, 0, 'usd',
   '{"diagnosisLimit":1,"looksLimit":2,"tutorialDetail":"basic","makeupPreview":false,"kitRecommend":"basic","historyDays":0,"savedLooksLimit":0}',
   0),
  ('pro_monthly', 'Beauty Pass Pro', 'pro', 'month', 1999, 'usd',
   '{"diagnosisLimit":5,"looksLimit":3,"tutorialDetail":"full","makeupPreview":true,"makeupPreviewQuality":"standard","kitRecommend":"full","historyDays":30,"savedLooksLimit":10}',
   1),
  ('pro_yearly', 'Beauty Pass Pro (Annual)', 'pro', 'year', 14900, 'usd',
   '{"diagnosisLimit":5,"looksLimit":3,"tutorialDetail":"full","makeupPreview":true,"makeupPreviewQuality":"standard","kitRecommend":"full","historyDays":30,"savedLooksLimit":10}',
   2),
  ('premium_monthly', 'Beauty Pass Premium', 'premium', 'month', 3999, 'usd',
   '{"diagnosisLimit":-1,"looksLimit":5,"tutorialDetail":"full_video","makeupPreview":true,"makeupPreviewQuality":"hd","kitRecommend":"full_budget","historyDays":-1,"savedLooksLimit":-1}',
   3),
  ('premium_yearly', 'Beauty Pass Premium (Annual)', 'premium', 'year', 29900, 'usd',
   '{"diagnosisLimit":-1,"looksLimit":5,"tutorialDetail":"full_video","makeupPreview":true,"makeupPreviewQuality":"hd","kitRecommend":"full_budget","historyDays":-1,"savedLooksLimit":-1}',
   4),
  ('single_occasion', 'Single Occasion Pack', 'pro', NULL, 999, 'usd',
   '{"diagnosisLimit":3,"looksLimit":3,"tutorialDetail":"full","makeupPreview":true,"makeupPreviewQuality":"standard","kitRecommend":"full","historyDays":7,"savedLooksLimit":1}',
   5);

-- ─── 更新现有表：为 tryon_jobs 和 usage_records 补充外键索引 ──
-- （不改表结构，仅添加有用的索引）
CREATE INDEX IF NOT EXISTS idx_usage_records_user
  ON usage_records (user_id);
