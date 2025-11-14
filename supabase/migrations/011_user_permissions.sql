-- Migration: User Permissions System
-- Created: 2025-11-14
-- Description: Granular user permissions for role-based access control

-- ============================================================================
-- UPDATE USERS TABLE
-- ============================================================================
-- Add permissions column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;

-- ============================================================================
-- DEFAULT PERMISSIONS
-- ============================================================================
-- Set default permissions for existing users based on role
UPDATE users
SET permissions = CASE
  WHEN role = 'admin' THEN '{
    "canVoidTransactions": true,
    "canGiveDiscount": true,
    "maxDiscountPercent": 100,
    "canCloseDay": true,
    "canManageUsers": true,
    "canEditPrices": true,
    "canManagePromotions": true,
    "canViewReports": true,
    "canManageInventory": true
  }'::jsonb
  WHEN role = 'manager' THEN '{
    "canVoidTransactions": true,
    "canGiveDiscount": true,
    "maxDiscountPercent": 50,
    "canCloseDay": true,
    "canManageUsers": false,
    "canEditPrices": true,
    "canManagePromotions": false,
    "canViewReports": true,
    "canManageInventory": true
  }'::jsonb
  WHEN role = 'cashier' THEN '{
    "canVoidTransactions": false,
    "canGiveDiscount": true,
    "maxDiscountPercent": 10,
    "canCloseDay": false,
    "canManageUsers": false,
    "canEditPrices": false,
    "canManagePromotions": false,
    "canViewReports": false,
    "canManageInventory": false
  }'::jsonb
  ELSE '{
    "canVoidTransactions": false,
    "canGiveDiscount": false,
    "maxDiscountPercent": 0,
    "canCloseDay": false,
    "canManageUsers": false,
    "canEditPrices": false,
    "canManagePromotions": false,
    "canViewReports": false,
    "canManageInventory": false
  }'::jsonb
END
WHERE permissions = '{}'::jsonb OR permissions IS NULL;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
  user_id UUID,
  permission_key TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN;
BEGIN
  SELECT (permissions->permission_key)::boolean
  INTO has_permission
  FROM users
  WHERE id = user_id;

  RETURN COALESCE(has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's max discount percent
CREATE OR REPLACE FUNCTION get_max_discount_percent(
  user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  max_discount INTEGER;
BEGIN
  SELECT (permissions->>'maxDiscountPercent')::integer
  INTO max_discount
  FROM users
  WHERE id = user_id;

  RETURN COALESCE(max_discount, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INDEXES
-- ============================================================================
-- GIN index for JSONB permissions column for faster queries
CREATE INDEX idx_users_permissions ON users USING GIN (permissions);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON COLUMN users.permissions IS 'JSONB object containing granular user permissions';

COMMENT ON FUNCTION user_has_permission IS 'Check if a user has a specific permission';
COMMENT ON FUNCTION get_max_discount_percent IS 'Get maximum discount percentage allowed for user';

-- ============================================================================
-- SAMPLE PERMISSIONS STRUCTURE
-- ============================================================================
/*
Example permissions object:
{
  "canVoidTransactions": true,
  "canGiveDiscount": true,
  "maxDiscountPercent": 20,
  "canCloseDay": false,
  "canManageUsers": false,
  "canEditPrices": false,
  "canManagePromotions": false,
  "canViewReports": true,
  "canManageInventory": true
}
*/
