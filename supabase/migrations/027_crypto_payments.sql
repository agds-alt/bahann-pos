-- Add crypto payment fields to payment_requests
ALTER TABLE payment_requests
  ADD COLUMN IF NOT EXISTS crypto_amount DECIMAL(20,6),
  ADD COLUMN IF NOT EXISTS crypto_token  VARCHAR(10),
  ADD COLUMN IF NOT EXISTS crypto_tx_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_payment_requests_crypto
  ON payment_requests (crypto_token, crypto_amount)
  WHERE status = 'pending' AND crypto_token IS NOT NULL;
