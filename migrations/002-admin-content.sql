BEGIN;
CREATE TABLE IF NOT EXISTS mai_site_content (
  key text PRIMARY KEY,
  value text NOT NULL CHECK (length(value) <= 12000),
  revision integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid NOT NULL
);
CREATE TABLE IF NOT EXISTS mai_content_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key text NOT NULL,
  previous_value text,
  value text NOT NULL,
  actor uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS mai_login_limits (
  key text PRIMARY KEY,
  attempts integer NOT NULL,
  expires_at timestamptz NOT NULL
);
ALTER TABLE mai_site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE mai_content_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE mai_login_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON mai_site_content, mai_content_audit, mai_login_limits FROM PUBLIC;
REVOKE ALL ON SEQUENCE mai_content_audit_id_seq FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON mai_site_content, mai_content_audit, mai_login_limits FROM anon;
    REVOKE ALL ON SEQUENCE mai_content_audit_id_seq FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON mai_site_content, mai_content_audit, mai_login_limits FROM authenticated;
    REVOKE ALL ON SEQUENCE mai_content_audit_id_seq FROM authenticated;
  END IF;
END $$;
INSERT INTO mai_schema (version) VALUES (2) ON CONFLICT DO NOTHING;
COMMIT;
