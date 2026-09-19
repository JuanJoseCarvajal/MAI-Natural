BEGIN;
CREATE TABLE IF NOT EXISTS mai_schema (version integer PRIMARY KEY);
CREATE TABLE IF NOT EXISTS mai_records (
  kind text NOT NULL CHECK (kind IN ('user', 'passwordResetToken', 'appointment', 'order')),
  id uuid NOT NULL,
  data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object'),
  PRIMARY KEY (kind, id),
  CHECK (data->>'id' = id::text)
);
CREATE UNIQUE INDEX IF NOT EXISTS mai_user_email ON mai_records (lower(data->>'email')) WHERE kind = 'user';
CREATE UNIQUE INDEX IF NOT EXISTS mai_token_hash ON mai_records ((data->>'tokenHash')) WHERE kind = 'passwordResetToken';
CREATE UNIQUE INDEX IF NOT EXISTS mai_wompi_transaction ON mai_records ((data->>'wompiTransactionId')) WHERE data->>'wompiTransactionId' IS NOT NULL;
INSERT INTO mai_schema (version) VALUES (1) ON CONFLICT DO NOTHING;
COMMIT;
