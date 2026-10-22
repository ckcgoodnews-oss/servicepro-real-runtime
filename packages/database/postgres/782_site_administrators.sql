-- Only the trusted API/database owner can manage this registry. Tenant roles
-- and Supabase's public API must never be able to grant platform privileges.
CREATE TABLE IF NOT EXISTS runtime_site_admins (
  tenant_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES runtime_users(id) ON DELETE CASCADE,
  granted_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id,user_id)
);
ALTER TABLE runtime_site_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON runtime_site_admins FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
    REVOKE ALL ON runtime_site_admins FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
    REVOKE ALL ON runtime_site_admins FROM authenticated;
  END IF;
END $$;
