-- Migration: Audit Logs Table
-- Created: 2024
-- Description: Track all critical operations for compliance and security

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  changes JSONB,
  metadata JSONB,
  ip_address VARCHAR(45), -- IPv6 max length
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id) WHERE entity_id IS NOT NULL;

-- Create composite index for common queries
CREATE INDEX idx_audit_logs_user_entity ON audit_logs(user_id, entity_type, created_at DESC);

-- Add comments
COMMENT ON TABLE audit_logs IS 'Audit trail for all critical operations';
COMMENT ON COLUMN audit_logs.user_id IS 'ID of user who performed the action';
COMMENT ON COLUMN audit_logs.user_email IS 'Email of user (denormalized for historical tracking)';
COMMENT ON COLUMN audit_logs.action IS 'Type of action: CREATE, UPDATE, DELETE, LOGIN, etc.';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity affected: user, product, outlet, etc.';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID of the affected entity';
COMMENT ON COLUMN audit_logs.changes IS 'JSON object containing before/after values';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context data';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the client';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string of the client';

-- Enable Row Level Security (RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read audit logs
CREATE POLICY "Admins can read all audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: System can insert audit logs (no user restrictions)
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Add retention policy comment (implement with pg_cron if needed)
COMMENT ON TABLE audit_logs IS 'Audit logs with 90-day retention policy (implement cleanup with pg_cron)';
