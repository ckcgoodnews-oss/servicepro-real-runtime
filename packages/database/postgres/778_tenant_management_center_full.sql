BEGIN;

-- ============================================================
-- TENANT MANAGEMENT CENTER - Complete Schema
-- Sprint 1-10: Foundation through Recovery
-- ============================================================

-- Sprint 1: Foundation (extends existing platform_tenant_admin_records)
ALTER TABLE platform_tenant_admin_records
  ADD COLUMN IF NOT EXISTS subscription_plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS subscription_seats int NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS subscription_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS billing_provider text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS billing_external_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS billing_email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS usage_limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS white_label jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS health_score int NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS health_issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS last_health_check_at timestamptz,
  ADD COLUMN IF NOT EXISTS permanently_purged_at timestamptz;

-- Sprint 3: Impersonation sessions
CREATE TABLE IF NOT EXISTS platform_impersonation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id text NOT NULL,
  admin_email text NOT NULL,
  target_tenant_id text NOT NULL,
  target_owner_id text NOT NULL,
  target_owner_email text NOT NULL,
  mode text NOT NULL DEFAULT 'full',
  token_hash text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  ended_reason text NOT NULL DEFAULT '',
  ip_address text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS platform_impersonation_sessions_active_idx
  ON platform_impersonation_sessions (admin_user_id, ended_at)
  WHERE ended_at IS NULL;

CREATE INDEX IF NOT EXISTS platform_impersonation_sessions_tenant_idx
  ON platform_impersonation_sessions (target_tenant_id, started_at DESC);

-- Sprint 4: Subscription & billing history
CREATE TABLE IF NOT EXISTS platform_billing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  event_type text NOT NULL,
  amount_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  description text NOT NULL DEFAULT '',
  external_id text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS platform_billing_events_tenant_idx
  ON platform_billing_events (tenant_id, created_at DESC);

-- Sprint 5: Feature management (per-tenant module configuration)
CREATE TABLE IF NOT EXISTS platform_tenant_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  module_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  is_beta boolean NOT NULL DEFAULT false,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled_at timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS platform_tenant_modules_tenant_module_idx
  ON platform_tenant_modules (tenant_id, module_key);

-- Sprint 7: OAuth clients
CREATE TABLE IF NOT EXISTS platform_tenant_oauth_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  client_name text NOT NULL,
  client_id text NOT NULL UNIQUE,
  client_secret_hash text NOT NULL,
  redirect_uris jsonb NOT NULL DEFAULT '[]'::jsonb,
  scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  rate_limit_rpm int NOT NULL DEFAULT 60,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Sprint 7: Webhooks
CREATE TABLE IF NOT EXISTS platform_tenant_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  url text NOT NULL,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,
  secret_hash text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  last_triggered_at timestamptz,
  failure_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Sprint 8: Usage snapshots for monitoring
CREATE TABLE IF NOT EXISTS platform_tenant_usage_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  users_count int NOT NULL DEFAULT 0,
  customers_count int NOT NULL DEFAULT 0,
  jobs_count int NOT NULL DEFAULT 0,
  assets_count int NOT NULL DEFAULT 0,
  storage_bytes bigint NOT NULL DEFAULT 0,
  api_calls_count bigint NOT NULL DEFAULT 0,
  login_count int NOT NULL DEFAULT 0,
  error_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS platform_tenant_usage_snapshots_tenant_date_idx
  ON platform_tenant_usage_snapshots (tenant_id, snapshot_date);

COMMIT;
