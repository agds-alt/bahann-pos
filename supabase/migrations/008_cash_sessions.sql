-- Migration: Cash Session Management (End of Day)
-- Created: 2025-11-14
-- Description: Track cash sessions for end-of-day reconciliation

-- ============================================================================
-- CASH SESSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cash_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id UUID REFERENCES outlets(id) ON DELETE RESTRICT,

  -- Opening details
  opened_by UUID REFERENCES users(id) ON DELETE RESTRICT,
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL,
  opening_cash DECIMAL(15,2) NOT NULL,

  -- Closing details
  closed_by UUID REFERENCES users(id) ON DELETE RESTRICT,
  closed_at TIMESTAMP WITH TIME ZONE,
  closing_cash DECIMAL(15,2),

  -- Calculated fields
  expected_cash DECIMAL(15,2),
  actual_cash DECIMAL(15,2),
  difference DECIMAL(15,2),

  -- Summary fields
  total_sales DECIMAL(15,2),
  total_transactions INTEGER,
  cash_sales DECIMAL(15,2),
  card_sales DECIMAL(15,2),
  transfer_sales DECIMAL(15,2),
  ewallet_sales DECIMAL(15,2),
  total_discount DECIMAL(15,2),

  notes TEXT,
  status VARCHAR(20) DEFAULT 'open',
  -- status: 'open', 'closed'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('open', 'closed')),
  CONSTRAINT positive_amounts CHECK (
    opening_cash >= 0 AND
    (closing_cash IS NULL OR closing_cash >= 0)
  )
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_cash_sessions_outlet_id ON cash_sessions(outlet_id);
CREATE INDEX idx_cash_sessions_status ON cash_sessions(status);
CREATE INDEX idx_cash_sessions_opened_at ON cash_sessions(opened_at DESC);
CREATE INDEX idx_cash_sessions_closed_at ON cash_sessions(closed_at DESC) WHERE closed_at IS NOT NULL;

-- Composite index for finding current open session
CREATE INDEX idx_cash_sessions_outlet_status ON cash_sessions(outlet_id, status);

-- ============================================================================
-- TRIGGER
-- ============================================================================
CREATE TRIGGER update_cash_sessions_updated_at
  BEFORE UPDATE ON cash_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view sessions from their outlet or if they're admin
CREATE POLICY "Users can view cash sessions from their outlet"
  ON cash_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.outlet_id = cash_sessions.outlet_id OR users.role = 'admin')
    )
  );

-- Users can create cash sessions
CREATE POLICY "Users can create cash sessions"
  ON cash_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
    )
  );

-- Users can update cash sessions
CREATE POLICY "Users can update cash sessions"
  ON cash_sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.outlet_id = cash_sessions.outlet_id OR users.role = 'admin')
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE cash_sessions IS 'Cash drawer sessions for end-of-day reconciliation';
COMMENT ON COLUMN cash_sessions.opening_cash IS 'Starting cash amount in drawer';
COMMENT ON COLUMN cash_sessions.closing_cash IS 'Actual cash counted at end of day';
COMMENT ON COLUMN cash_sessions.expected_cash IS 'Opening cash + cash sales';
COMMENT ON COLUMN cash_sessions.actual_cash IS 'Same as closing_cash (for clarity)';
COMMENT ON COLUMN cash_sessions.difference IS 'Actual minus expected (over/short)';
