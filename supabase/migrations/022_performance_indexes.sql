-- Performance indexes untuk query-query paling sering dipakai
-- Semua pakai IF NOT EXISTS agar aman dijalankan ulang

-- Ekstensi untuk trigram search (ilike pada name/sku/barcode)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── outlets ──────────────────────────────────────────────────────────────────
-- Filter by owner (multi-tenancy scope — query paling sering)
CREATE INDEX IF NOT EXISTS idx_outlets_owner_id
  ON outlets (owner_id);

-- ─── products ─────────────────────────────────────────────────────────────────
-- Filter by owner (catalog per tenant)
CREATE INDEX IF NOT EXISTS idx_products_owner_id
  ON products (owner_id);

-- Search by name/SKU/barcode (ilike search di products page + POS)
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON products USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_sku_trgm
  ON products USING gin (sku gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_barcode
  ON products (barcode)
  WHERE barcode IS NOT NULL;

-- ─── transactions ─────────────────────────────────────────────────────────────
-- Filter by outlet + date range (dashboard, revenue, history pages)
CREATE INDEX IF NOT EXISTS idx_transactions_outlet_id
  ON transactions (outlet_id);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at
  ON transactions (created_at DESC);

-- Composite: outlet + date (paling sering: filter outlet lalu order by date)
CREATE INDEX IF NOT EXISTS idx_transactions_outlet_created
  ON transactions (outlet_id, created_at DESC);

-- Filter by status (hampir semua query: WHERE status = 'completed')
CREATE INDEX IF NOT EXISTS idx_transactions_status
  ON transactions (status);

-- Composite: status + date (dashboard getStats, getSalesTrend)
CREATE INDEX IF NOT EXISTS idx_transactions_status_created
  ON transactions (status, created_at DESC);

-- ─── transaction_items ────────────────────────────────────────────────────────
-- JOIN dari transactions (getTopProducts)
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id
  ON transaction_items (transaction_id);

-- Filter by product (top selling products)
CREATE INDEX IF NOT EXISTS idx_transaction_items_product_id
  ON transaction_items (product_id);

-- ─── daily_stock ──────────────────────────────────────────────────────────────
-- Filter by outlet + date (stock page, dashboard getLowStock)
CREATE INDEX IF NOT EXISTS idx_daily_stock_outlet_id
  ON daily_stock (outlet_id);

CREATE INDEX IF NOT EXISTS idx_daily_stock_stock_date
  ON daily_stock (stock_date DESC);

-- Composite: product + outlet + date (upsert conflict target)
CREATE INDEX IF NOT EXISTS idx_daily_stock_product_outlet_date
  ON daily_stock (product_id, outlet_id, stock_date DESC);

-- ─── stock_alerts ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_stock_alerts_outlet_id
  ON stock_alerts (outlet_id);

CREATE INDEX IF NOT EXISTS idx_stock_alerts_created_at
  ON stock_alerts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_alerts_is_acknowledged
  ON stock_alerts (is_acknowledged)
  WHERE is_acknowledged = false;

-- ─── audit_logs ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
  ON audit_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON audit_logs (created_at DESC);

-- ─── users ────────────────────────────────────────────────────────────────────
-- Login lookup
CREATE INDEX IF NOT EXISTS idx_users_email
  ON users (email);

-- Cashier lookup by outlet
CREATE INDEX IF NOT EXISTS idx_users_outlet_id
  ON users (outlet_id)
  WHERE outlet_id IS NOT NULL;
