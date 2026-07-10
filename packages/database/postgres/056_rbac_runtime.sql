-- Sprint 56 PostgreSQL migration: RBAC runtime metadata and auth events.

CREATE TABLE IF NOT EXISTS runtime_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_key text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS runtime_role_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL,
  permission_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_key, permission_key)
);

CREATE TABLE IF NOT EXISTS runtime_authorization_denials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text,
  user_id uuid,
  permission_key text NOT NULL,
  route text NOT NULL DEFAULT '',
  method text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_runtime_authorization_denials_tenant_time
ON runtime_authorization_denials (tenant_id, created_at DESC);

INSERT INTO runtime_permissions (permission_key, category)
VALUES
  ('users.self.read', 'users'),
  ('customers.read', 'customers'),
  ('customers.write', 'customers'),
  ('customers.delete', 'customers'),
  ('jobs.read', 'jobs'),
  ('jobs.write', 'jobs'),
  ('jobs.delete', 'jobs'),
  ('admin.authz.read', 'admin')
ON CONFLICT (permission_key) DO NOTHING;
