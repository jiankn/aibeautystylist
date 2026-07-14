ALTER TABLE pinterest_guest_passes ADD COLUMN device_key_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_pinterest_guest_passes_device_usage
  ON pinterest_guest_passes(device_key_hash, used_at);

CREATE INDEX IF NOT EXISTS idx_pinterest_guest_passes_client_usage
  ON pinterest_guest_passes(client_key_hash, used_at);

CREATE INDEX IF NOT EXISTS idx_pinterest_guest_passes_used_at
  ON pinterest_guest_passes(used_at);
