-- Super Admin Panel: add is_suspended flag to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_users_is_suspended
  ON users (is_suspended) WHERE is_suspended = true;
