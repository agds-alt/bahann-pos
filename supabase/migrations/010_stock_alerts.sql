-- Migration: Stock Alerts System
-- Created: 2025-11-14
-- Description: Low stock alerts and inventory notifications

-- ============================================================================
-- UPDATE PRODUCTS TABLE
-- ============================================================================
-- Add reorder fields to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS lead_time_days INTEGER DEFAULT 3;

-- ============================================================================
-- STOCK ALERTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  -- alert_type: 'low_stock', 'out_of_stock', 'reorder_suggested'

  current_stock INTEGER NOT NULL,
  reorder_point INTEGER NOT NULL,

  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_alert_type CHECK (alert_type IN ('low_stock', 'out_of_stock', 'reorder_suggested')),
  CONSTRAINT valid_stock_values CHECK (current_stock >= 0 AND reorder_point >= 0)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_stock_alerts_product_id ON stock_alerts(product_id);
CREATE INDEX idx_stock_alerts_outlet_id ON stock_alerts(outlet_id);
CREATE INDEX idx_stock_alerts_is_acknowledged ON stock_alerts(is_acknowledged);
CREATE INDEX idx_stock_alerts_alert_type ON stock_alerts(alert_type);
CREATE INDEX idx_stock_alerts_created_at ON stock_alerts(created_at DESC);

-- Composite index for finding active alerts
CREATE INDEX idx_stock_alerts_active ON stock_alerts(outlet_id, is_acknowledged, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

-- Users can view alerts from their outlet or if they're admin
CREATE POLICY "Users can view stock alerts from their outlet"
  ON stock_alerts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.outlet_id = stock_alerts.outlet_id OR users.role = 'admin')
    )
  );

-- System can insert alerts
CREATE POLICY "System can insert stock alerts"
  ON stock_alerts
  FOR INSERT
  WITH CHECK (true);

-- Users can update alerts (for acknowledgement)
CREATE POLICY "Users can update stock alerts"
  ON stock_alerts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.outlet_id = stock_alerts.outlet_id OR users.role = 'admin')
    )
  );

-- ============================================================================
-- HELPER FUNCTION
-- ============================================================================
-- Function to automatically generate stock alerts
CREATE OR REPLACE FUNCTION generate_stock_alerts()
RETURNS TABLE (
  alerts_generated INTEGER
) AS $$
DECLARE
  alert_count INTEGER := 0;
  stock_record RECORD;
  latest_stock RECORD;
BEGIN
  -- Get latest stock for each product-outlet combination
  FOR stock_record IN
    SELECT DISTINCT ON (ds.product_id, ds.outlet_id)
      ds.product_id,
      ds.outlet_id,
      ds.stock_akhir as current_stock,
      p.reorder_point,
      p.name as product_name
    FROM daily_stock ds
    JOIN products p ON p.id = ds.product_id
    ORDER BY ds.product_id, ds.outlet_id, ds.stock_date DESC
  LOOP
    -- Check if alert already exists for this product-outlet
    IF NOT EXISTS (
      SELECT 1 FROM stock_alerts
      WHERE product_id = stock_record.product_id
        AND outlet_id = stock_record.outlet_id
        AND is_acknowledged = false
    ) THEN
      -- Create alert based on stock level
      IF stock_record.current_stock <= 0 THEN
        INSERT INTO stock_alerts (product_id, outlet_id, alert_type, current_stock, reorder_point)
        VALUES (
          stock_record.product_id,
          stock_record.outlet_id,
          'out_of_stock',
          stock_record.current_stock,
          stock_record.reorder_point
        );
        alert_count := alert_count + 1;
      ELSIF stock_record.current_stock <= stock_record.reorder_point THEN
        INSERT INTO stock_alerts (product_id, outlet_id, alert_type, current_stock, reorder_point)
        VALUES (
          stock_record.product_id,
          stock_record.outlet_id,
          'low_stock',
          stock_record.current_stock,
          stock_record.reorder_point
        );
        alert_count := alert_count + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN QUERY SELECT alert_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE stock_alerts IS 'Inventory alerts for low/out of stock situations';
COMMENT ON COLUMN stock_alerts.alert_type IS 'Type of alert: low_stock, out_of_stock, reorder_suggested';
COMMENT ON COLUMN stock_alerts.is_acknowledged IS 'Whether the alert has been reviewed';

COMMENT ON COLUMN products.reorder_point IS 'Stock level that triggers low stock alert';
COMMENT ON COLUMN products.reorder_quantity IS 'Suggested quantity to reorder';
COMMENT ON COLUMN products.lead_time_days IS 'Expected days for delivery';
