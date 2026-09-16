CREATE TABLE IF NOT EXISTS attestations (
  id SERIAL PRIMARY KEY,
  issuer TEXT NOT NULL,
  subject TEXT NOT NULL,
  schema_id TEXT NOT NULL,
  data TEXT NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  block_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attestations_subject ON attestations(subject);
CREATE INDEX IF NOT EXISTS idx_attestations_schema_id ON attestations(schema_id);