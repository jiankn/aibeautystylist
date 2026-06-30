-- 用户头像：对象本体保存在私有 R2，账户表只保存对象键和缓存版本时间。
ALTER TABLE auth_accounts ADD COLUMN avatar_r2_key TEXT;
ALTER TABLE auth_accounts ADD COLUMN avatar_updated_at TEXT;
