BEGIN;
CREATE TABLE IF NOT EXISTS mai_catalogs (
  name text PRIMARY KEY CHECK (name IN ('products', 'discounts')),
  items jsonb NOT NULL CHECK (jsonb_typeof(items) = 'array'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE mai_catalogs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON mai_catalogs FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON mai_catalogs FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON mai_catalogs FROM authenticated;
  END IF;
END $$;
INSERT INTO mai_schema (version) VALUES (3) ON CONFLICT DO NOTHING;
COMMIT;
