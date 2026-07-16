-- Sprint 55 PostgreSQL migration: executable auth runtime.

CREATE TABLE IF NOT EXISTS runtime_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  email text NOT NULL,
  name text NOT NULL DEFAULT '',
  password_hash text NOT NULL,
  roles jsonb NOT NULL DEFAULT '[]'::jsonb,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active',
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS runtime_auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  user_id uuid NOT NULL,
  token_hash text,
  ip_address text,
  user_agent text,
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz
);

CREATE TABLE IF NOT EXISTS runtime_auth_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text,
  user_id uuid,
  event_type text NOT NULL,
  email text,
  ip_address text,
  status text NOT NULL DEFAULT 'success',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_runtime_users_tenant_email
ON runtime_users (tenant_id, lower(email));

CREATE INDEX IF NOT EXISTS idx_runtime_auth_events_tenant_time
ON runtime_auth_events (tenant_id, created_at DESC);
