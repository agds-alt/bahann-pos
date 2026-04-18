-- Add trial period columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_trial BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Index for the cron job query (find expired trials)
CREATE INDEX IF NOT EXISTS idx_users_trial_active
  ON users (is_trial, trial_ends_at)
  WHERE is_trial = true;
