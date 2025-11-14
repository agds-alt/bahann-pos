-- Migration: Promotions and Discount System
-- Created: 2025-11-14
-- Description: Flexible promotion system with various discount types

-- ============================================================================
-- PROMOTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  type VARCHAR(50) NOT NULL,
  -- type: 'fixed', 'percentage', 'buy_x_get_y'

  -- Discount values
  discount_amount DECIMAL(15,2),
  discount_percentage DECIMAL(5,2),

  -- Conditions
  min_purchase DECIMAL(15,2),
  max_discount DECIMAL(15,2),
  applicable_products UUID[], -- Array of product IDs
  applicable_categories TEXT[],

  -- Buy X Get Y
  buy_quantity INTEGER,
  get_quantity INTEGER,
  get_product_id UUID REFERENCES products(id) ON DELETE SET NULL,

  -- Validity
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,

  -- Usage limits
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  max_uses_per_customer INTEGER,

  created_by UUID REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_type CHECK (type IN ('fixed', 'percentage', 'buy_x_get_y')),
  CONSTRAINT valid_discount_percentage CHECK (
    discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100)
  ),
  CONSTRAINT valid_amounts CHECK (
    (discount_amount IS NULL OR discount_amount >= 0) AND
    (min_purchase IS NULL OR min_purchase >= 0) AND
    (max_discount IS NULL OR max_discount >= 0)
  ),
  CONSTRAINT valid_uses CHECK (
    uses_count >= 0 AND
    (max_uses IS NULL OR max_uses > 0) AND
    (max_uses_per_customer IS NULL OR max_uses_per_customer > 0)
  )
);

-- ============================================================================
-- PROMOTION USAGE TABLE
-- ============================================================================
-- Track individual promotion uses for per-customer limits
CREATE TABLE IF NOT EXISTS promotion_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  discount_applied DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate usage in same transaction
  CONSTRAINT unique_promotion_per_transaction UNIQUE (promotion_id, transaction_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_is_active ON promotions(is_active);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX idx_promotions_type ON promotions(type);
CREATE INDEX idx_promotions_created_by ON promotions(created_by);

CREATE INDEX idx_promotion_usage_promotion_id ON promotion_usage(promotion_id);
CREATE INDEX idx_promotion_usage_transaction_id ON promotion_usage(transaction_id);
CREATE INDEX idx_promotion_usage_user_id ON promotion_usage(user_id);

-- ============================================================================
-- TRIGGER
-- ============================================================================
CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_usage ENABLE ROW LEVEL SECURITY;

-- Anyone can view active promotions
CREATE POLICY "Anyone can view active promotions"
  ON promotions
  FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));

-- Only admins can create promotions
CREATE POLICY "Admins can create promotions"
  ON promotions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Only admins can update promotions
CREATE POLICY "Admins can update promotions"
  ON promotions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can view their own promotion usage
CREATE POLICY "Users can view promotion usage"
  ON promotion_usage
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- System can insert promotion usage
CREATE POLICY "System can insert promotion usage"
  ON promotion_usage
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE promotions IS 'Flexible promotion and discount system';
COMMENT ON TABLE promotion_usage IS 'Tracks individual promotion uses';

COMMENT ON COLUMN promotions.code IS 'Unique promo code (e.g., SUMMER2024)';
COMMENT ON COLUMN promotions.type IS 'Discount type: fixed amount, percentage, or buy X get Y';
COMMENT ON COLUMN promotions.discount_amount IS 'Fixed discount amount (for type=fixed)';
COMMENT ON COLUMN promotions.discount_percentage IS 'Percentage discount (for type=percentage)';
COMMENT ON COLUMN promotions.min_purchase IS 'Minimum purchase amount required';
COMMENT ON COLUMN promotions.max_discount IS 'Maximum discount cap (useful for percentage)';
COMMENT ON COLUMN promotions.uses_count IS 'Number of times this promotion has been used';
