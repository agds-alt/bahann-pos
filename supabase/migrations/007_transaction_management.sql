-- Migration: Transaction Management System
-- Created: 2025-11-14
-- Description: Add comprehensive transaction tracking with void/refund capabilities

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
-- Track all sales as atomic units with full lifecycle management
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id VARCHAR(50) UNIQUE NOT NULL,
  outlet_id UUID REFERENCES outlets(id) ON DELETE RESTRICT,
  cashier_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'completed',
  -- status: 'pending', 'completed', 'voided', 'refunded'

  -- Financial details
  subtotal DECIMAL(15,2) NOT NULL,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,

  -- Payment details
  payment_method VARCHAR(50) NOT NULL,
  -- payment_method: 'cash', 'card', 'transfer', 'ewallet'
  amount_paid DECIMAL(15,2) NOT NULL,
  change_amount DECIMAL(15,2) DEFAULT 0,

  -- Void tracking
  void_reason TEXT,
  voided_by UUID REFERENCES users(id) ON DELETE RESTRICT,
  voided_at TIMESTAMP WITH TIME ZONE,

  -- Refund tracking
  refund_reason TEXT,
  refunded_by UUID REFERENCES users(id) ON DELETE RESTRICT,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_amount DECIMAL(15,2),

  -- Additional info
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'voided', 'refunded')),
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('cash', 'card', 'transfer', 'ewallet')),
  CONSTRAINT positive_amounts CHECK (
    subtotal >= 0 AND
    discount_amount >= 0 AND
    tax_amount >= 0 AND
    total_amount >= 0 AND
    amount_paid >= 0 AND
    change_amount >= 0
  ),
  CONSTRAINT valid_refund_amount CHECK (refund_amount IS NULL OR (refund_amount >= 0 AND refund_amount <= total_amount))
);

-- ============================================================================
-- TRANSACTION ITEMS TABLE
-- ============================================================================
-- Individual line items for each transaction
CREATE TABLE IF NOT EXISTS transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,

  -- Denormalized product data (for historical accuracy)
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),

  -- Line item details
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  line_total DECIMAL(15,2) NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT positive_prices CHECK (unit_price >= 0 AND line_total >= 0),
  CONSTRAINT valid_line_total CHECK (line_total = quantity * unit_price)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_outlet_id ON transactions(outlet_id);
CREATE INDEX idx_transactions_cashier_id ON transactions(cashier_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_transaction_id ON transactions(transaction_id);
CREATE INDEX idx_transactions_voided_by ON transactions(voided_by) WHERE voided_by IS NOT NULL;
CREATE INDEX idx_transactions_refunded_by ON transactions(refunded_by) WHERE refunded_by IS NOT NULL;
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method);

CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product_id ON transaction_items(product_id);

-- Composite indexes for common queries
CREATE INDEX idx_transactions_outlet_date ON transactions(outlet_id, created_at DESC);
CREATE INDEX idx_transactions_cashier_date ON transactions(cashier_id, created_at DESC);
CREATE INDEX idx_transactions_status_date ON transactions(status, created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view transactions from their outlet or if they're admin
CREATE POLICY "Users can view transactions from their outlet"
  ON transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.outlet_id = transactions.outlet_id OR users.role = 'admin')
    )
  );

-- Policy: Users can create transactions
CREATE POLICY "Users can create transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
    )
  );

-- Policy: Users can update transactions (for void/refund)
CREATE POLICY "Users can update transactions"
  ON transactions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.outlet_id = transactions.outlet_id OR users.role = 'admin')
    )
  );

-- Policy: Users can view transaction items
CREATE POLICY "Users can view transaction items"
  ON transaction_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      JOIN users u ON u.id = auth.uid()
      WHERE t.id = transaction_items.transaction_id
      AND (u.outlet_id = t.outlet_id OR u.role = 'admin')
    )
  );

-- Policy: Users can create transaction items
CREATE POLICY "Users can create transaction items"
  ON transaction_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
    )
  );

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE transactions IS 'Master transaction records with full lifecycle tracking';
COMMENT ON TABLE transaction_items IS 'Line items for each transaction';

COMMENT ON COLUMN transactions.transaction_id IS 'Human-readable transaction ID (e.g., TRX-1234567890-abc)';
COMMENT ON COLUMN transactions.status IS 'Transaction status: pending, completed, voided, refunded';
COMMENT ON COLUMN transactions.void_reason IS 'Reason for voiding (required when status=voided)';
COMMENT ON COLUMN transactions.refund_reason IS 'Reason for refund (required when status=refunded)';
COMMENT ON COLUMN transactions.refund_amount IS 'Amount refunded (can be partial)';

COMMENT ON COLUMN transaction_items.product_name IS 'Denormalized product name for historical accuracy';
COMMENT ON COLUMN transaction_items.product_sku IS 'Denormalized product SKU for historical accuracy';
COMMENT ON COLUMN transaction_items.line_total IS 'Calculated as quantity * unit_price';
