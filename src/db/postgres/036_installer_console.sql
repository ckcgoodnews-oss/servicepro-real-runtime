-- Sprint 36 PostgreSQL migration: installer console, licensing, feature flags, updates, and diagnostics.

CREATE TABLE IF NOT EXISTS installer_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'installer',
  active boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS installer_tenant_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_account_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  access_level text NOT NULL DEFAULT 'support',
  granted_by uuid,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE (installer_account_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS tenant_provisioning_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_business_name text NOT NULL,
  requested_domain text,
  owner_email text NOT NULL,
  owner_name text NOT NULL DEFAULT '',
  plan_code text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'pending',
  current_step text NOT NULL DEFAULT 'received',
  provisioned_tenant_id uuid,
  error_message text NOT NULL DEFAULT '',
  requested_by uuid,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS tenant_provisioning_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL,
  step_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  error_message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS license_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code text NOT NULL UNIQUE,
  name text NOT NULL,
  max_users integer NOT NULL DEFAULT 5,
  max_active_jobs integer NOT NULL DEFAULT 100,
  max_storage_mb integer NOT NULL DEFAULT 1024,
  api_access boolean NOT NULL DEFAULT false,
  ai_access boolean NOT NULL DEFAULT false,
  mobile_access boolean NOT NULL DEFAULT true,
  customer_portal_access boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_license_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE,
  plan_code text NOT NULL,
  license_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  seats_used integer NOT NULL DEFAULT 0,
  active_jobs_count integer NOT NULL DEFAULT 0,
  storage_used_mb numeric(14,2) NOT NULL DEFAULT 0,
  effective_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_feature_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  default_enabled boolean NOT NULL DEFAULT false,
  requires_plan text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_feature_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  feature_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'manual',
  reason text NOT NULL DEFAULT '',
  assigned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, feature_key)
);

CREATE TABLE IF NOT EXISTS branding_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  asset_type text NOT NULL,
  asset_name text NOT NULL,
  storage_key text NOT NULL,
  mime_type text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  uploaded_by uuid,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS update_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  stability_level text NOT NULL DEFAULT 'stable',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_update_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE,
  current_version text NOT NULL,
  target_version text,
  update_channel text NOT NULL DEFAULT 'stable',
  update_status text NOT NULL DEFAULT 'current',
  last_checked_at timestamptz,
  last_updated_at timestamptz,
  error_message text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS remote_diagnostics_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  requested_by uuid,
  approved_by uuid,
  status text NOT NULL DEFAULT 'requested',
  reason text NOT NULL DEFAULT '',
  access_scope text NOT NULL DEFAULT 'read_only',
  started_at timestamptz,
  expires_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_health_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  app_version text,
  database_status text NOT NULL DEFAULT 'unknown',
  job_queue_status text NOT NULL DEFAULT 'unknown',
  storage_status text NOT NULL DEFAULT 'unknown',
  error_count integer NOT NULL DEFAULT 0,
  warning_count integer NOT NULL DEFAULT 0,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  captured_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_installer_tenant_access_tenant
ON installer_tenant_access (tenant_id);

CREATE INDEX IF NOT EXISTS idx_provisioning_workflows_status
ON tenant_provisioning_workflows (status, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_tenant_feature_assignments_tenant
ON tenant_feature_assignments (tenant_id);

CREATE INDEX IF NOT EXISTS idx_remote_diagnostics_tenant_status
ON remote_diagnostics_sessions (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tenant_health_snapshots_tenant_time
ON tenant_health_snapshots (tenant_id, captured_at DESC);
