-- ============================================================================
-- 区域化上下文迁移
-- 新增用户内容偏好表和试妆任务区域化上下文列
-- ============================================================================

-- 用户内容偏好表（登录用户保存的偏好）
CREATE TABLE IF NOT EXISTS user_content_preferences (
  user_id TEXT PRIMARY KEY,
  locale TEXT NOT NULL,
  market_profile TEXT NOT NULL,
  beauty_preferences_json TEXT NOT NULL DEFAULT '[]',
  representation_preferences_json TEXT NOT NULL DEFAULT '["diverse"]',
  source TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 试妆任务增加区域化上下文列（旧任务这些列为 NULL，不影响现有功能）
ALTER TABLE tryon_jobs ADD COLUMN look_recipe_id TEXT;
ALTER TABLE tryon_jobs ADD COLUMN look_recipe_version TEXT;
ALTER TABLE tryon_jobs ADD COLUMN market_variant_id TEXT;
ALTER TABLE tryon_jobs ADD COLUMN reference_asset_id TEXT;
ALTER TABLE tryon_jobs ADD COLUMN locale TEXT;
ALTER TABLE tryon_jobs ADD COLUMN market_profile TEXT;
