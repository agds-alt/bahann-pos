-- Unique amount for bank transfer matching (base price + random offset 1-999)
ALTER TABLE payment_requests
  ADD COLUMN IF NOT EXISTS unique_amount INTEGER;
