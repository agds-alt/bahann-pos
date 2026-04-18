-- Migration: Enable RLS on all tables
-- App uses service role key which bypasses RLS, so this acts as a
-- safety net against direct DB access or future anon client usage.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE _migrations ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS entirely — no policies needed for app to work.
-- These policies only block direct anon/authenticated Supabase client access.

-- Block all anon access (deny by default when RLS is on and no policy matches)
-- No permissive policies = no access for non-service-role clients.
