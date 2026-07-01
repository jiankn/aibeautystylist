-- Cache structured private-reference makeup analysis and retain quality-gate metadata.
ALTER TABLE private_look_templates ADD COLUMN reference_sha256 TEXT;
ALTER TABLE private_look_templates ADD COLUMN makeup_spec_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE private_look_templates ADD COLUMN makeup_spec_version TEXT;
ALTER TABLE private_look_templates ADD COLUMN makeup_spec_json TEXT;

CREATE INDEX IF NOT EXISTS idx_private_look_templates_spec_status
  ON private_look_templates(user_id, makeup_spec_status);

ALTER TABLE ai_call_logs ADD COLUMN metadata_json TEXT;
