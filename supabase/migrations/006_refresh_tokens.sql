-- Migration: Refresh Tokens Table
-- Created: 2025
-- Description: Store refresh tokens for JWT rotation and improved security

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,  -- SHA-256 hash of refresh token
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE,         -- Track when token was used for rotation
  revoked_at TIMESTAMP WITH TIME ZONE,      -- Manual revocation
  device_info JSONB,                        -- Optional: track device/browser
  ip_address VARCHAR(45)                    -- Optional: track IP for security
);

-- Create indexes for better query performance
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_used_at ON refresh_tokens(used_at) WHERE used_at IS NOT NULL;
CREATE INDEX idx_refresh_tokens_revoked_at ON refresh_tokens(revoked_at) WHERE revoked_at IS NOT NULL;

-- Add comments
COMMENT ON TABLE refresh_tokens IS 'Refresh tokens for JWT rotation (30-day expiry)';
COMMENT ON COLUMN refresh_tokens.user_id IS 'ID of user who owns this refresh token';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA-256 hash of refresh token (never store plain tokens)';
COMMENT ON COLUMN refresh_tokens.expires_at IS 'Expiry timestamp (typically 30 days from creation)';
COMMENT ON COLUMN refresh_tokens.used_at IS 'When token was used for rotation (one-time use)';
COMMENT ON COLUMN refresh_tokens.revoked_at IS 'When token was manually revoked';
COMMENT ON COLUMN refresh_tokens.device_info IS 'Optional device/browser information';
COMMENT ON COLUMN refresh_tokens.ip_address IS 'Optional IP address for security monitoring';

-- Enable Row Level Security (RLS)
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own refresh tokens (for listing active sessions)
CREATE POLICY "Users can read own refresh tokens"
  ON refresh_tokens
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: System can insert refresh tokens
CREATE POLICY "System can insert refresh tokens"
  ON refresh_tokens
  FOR INSERT
  WITH CHECK (true);

-- Policy: System can update refresh tokens (for rotation)
CREATE POLICY "System can update refresh tokens"
  ON refresh_tokens
  FOR UPDATE
  USING (true);

-- Policy: Users can delete their own refresh tokens (logout from specific device)
CREATE POLICY "Users can delete own refresh tokens"
  ON refresh_tokens
  FOR DELETE
  USING (user_id = auth.uid());

-- Add cleanup function for expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_refresh_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM refresh_tokens
  WHERE expires_at < NOW()
    OR (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '7 days')
    OR (revoked_at IS NOT NULL AND revoked_at < NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Schedule cleanup with pg_cron (requires pg_cron extension)
-- Uncomment if pg_cron is available:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule(
--   'cleanup-refresh-tokens',
--   '0 3 * * *',  -- Every day at 3 AM
--   $$SELECT cleanup_expired_refresh_tokens()$$
-- );

COMMENT ON FUNCTION cleanup_expired_refresh_tokens IS 'Cleanup expired, used, and revoked refresh tokens';
