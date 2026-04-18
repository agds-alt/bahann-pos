-- Migration: Plan & Transaction Limits
-- Description: Add subscription plan tracking to users table

ALTER TABLE users
ADD COLUMN IF NOT EXISTS plan VARCHAR(20) NOT NULL DEFAULT 'free';

ALTER TABLE users
ADD CONSTRAINT IF NOT EXISTS valid_plan
  CHECK (plan IN ('free', 'warung', 'starter', 'professional', 'business', 'enterprise'));

-- Existing admin users default to 'starter' so they don't hit the free limit
UPDATE users SET plan = 'starter' WHERE role = 'admin' AND plan = 'free';
