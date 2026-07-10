-- Sprint 101 PostgreSQL migration: tenant security policy runtime.

CREATE TABLE IF NOT EXISTS tenant_security_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  mfa_mode text NOT NULL DEFAULT 'optional',
  session_timeout_minutes integer NOT NULL DEFAULT 480,
  max_concurrent_sessions integer NOT NULL DEFAULT 5,
  allow_password_login boolean NOT NULL DEFAULT true,
  require_sso boolean NOT NULL DEFAULT false,
  allowed_ip_ranges jsonb NOT NULL DEFAULT '[]'::jsonb,
  blocked_ip_ranges jsonb NOT NULL DEFAULT '[]'::jsonb,
  data_residency_region text NOT NULL DEFAULT 'us',
  restrict_exports boolean NOT NULL DEFAULT false,
  restrict_api_tokens boolean NOT NULL DEFAULT false,
  audit_log_retention_days integer NOT NULL DEFAULT 365,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS tenant_access_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  policy_id uuid,
  user_id text NOT NULL DEFAULT '',
  action text NOT NULL DEFAULT '',
  ip_address text NOT NULL DEFAULT '',
  result text NOT NULL,
  reason text NOT NULL DEFAULT '',
  challenges jsonb NOT NULL DEFAULT '[]'::jsonb,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_security_policies_tenant_status
ON tenant_security_policies (tenant_id, status, name);

CREATE INDEX IF NOT EXISTS idx_tenant_access_decisions_tenant_user
ON tenant_access_decisions (tenant_id, user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tenant_access_decisions_tenant_result
ON tenant_access_decisions (tenant_id, result, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tenant_access_decisions_tenant_action
ON tenant_access_decisions (tenant_id, action, created_at DESC);
