-- Sprint 21 PostgreSQL migration: white-label SaaS administration.

CREATE TABLE IF NOT EXISTS tenant_branding_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE,
  brand_name text NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#1d72d2',
  secondary_color text DEFAULT '#102a43',
  support_email text,
  support_phone text,
  custom_css text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE,
  license_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  seats_allowed integer NOT NULL DEFAULT 5,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  default_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  feature_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, feature_key)
);

CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code text NOT NULL UNIQUE,
  name text NOT NULL,
  monthly_price numeric(12,2) NOT NULL DEFAULT 0,
  annual_price numeric(12,2) NOT NULL DEFAULT 0,
  included_users integer NOT NULL DEFAULT 1,
  included_jobs integer NOT NULL DEFAULT 100,
  included_storage_mb integer NOT NULL DEFAULT 1024,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE,
  plan_code text NOT NULL,
  status text NOT NULL DEFAULT 'trialing',
  current_period_start timestamptz,
  current_period_end timestamptz,
  external_customer_id text,
  external_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usage_meter_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  meter_key text NOT NULL,
  quantity numeric(14,4) NOT NULL DEFAULT 1,
  event_time timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS remote_configuration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  config_key text NOT NULL,
  config_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  managed_by text NOT NULL DEFAULT 'installer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, config_key)
);

CREATE TABLE IF NOT EXISTS tenant_provisioning_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_business_name text NOT NULL,
  requested_domain text,
  owner_email text NOT NULL,
  plan_code text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'pending',
  provisioned_tenant_id uuid,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_usage_meter_events_tenant_time
ON usage_meter_events (tenant_id, event_time DESC);

CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_tenant
ON tenant_feature_flags (tenant_id);
