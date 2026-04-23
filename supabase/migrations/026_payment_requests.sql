-- Manual payment requests for subscription upgrades
CREATE TABLE IF NOT EXISTS payment_requests (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan          VARCHAR(20) NOT NULL,
  amount        INTEGER     NOT NULL DEFAULT 0,
  payment_method VARCHAR(30) NOT NULL DEFAULT 'bank_transfer',
  proof_url     TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'pending',
  admin_note    TEXT,
  reviewed_by   UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id
  ON payment_requests (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_requests_status
  ON payment_requests (status) WHERE status = 'pending';

ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
