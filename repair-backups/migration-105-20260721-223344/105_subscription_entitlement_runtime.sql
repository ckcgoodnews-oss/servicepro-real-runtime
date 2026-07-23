-- Sprint 105 PostgreSQL migration: subscription, billing, and entitlement runtime.

CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  billing_interval text NOT NULL DEFAULT 'monthly',
  base_price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  trial_days integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plan_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  entitlement_key text NOT NULL,
  value_type text NOT NULL DEFAULT 'boolean',
  value jsonb NOT NULL DEFAULT 'true'::jsonb,
  description text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, entitlement_key)
);

CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  plan_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  external_customer_id text NOT NULL DEFAULT '',
  external_subscription_id text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usage_meters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meter_key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  unit text NOT NULL DEFAULT 'count',
  aggregation text NOT NULL DEFAULT 'sum',
  billable boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  subscription_id uuid,
  meter_key text NOT NULL,
  quantity numeric(18,4) NOT NULL DEFAULT 0,
  source_id text NOT NULL DEFAULT '',
  source_type text NOT NULL DEFAULT '',
  recorded_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  subscription_id uuid NOT NULL,
  invoice_number text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  subtotal_cents integer NOT NULL DEFAULT 0,
  tax_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  issued_at timestamptz NOT NULL,
  due_at timestamptz,
  paid_at timestamptz,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant_status
ON tenant_subscriptions (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_plan_entitlements_plan
ON plan_entitlements (plan_id, entitlement_key);

CREATE INDEX IF NOT EXISTS idx_usage_records_tenant_meter
ON usage_records (tenant_id, meter_key, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_billing_invoices_tenant_status
ON billing_invoices (tenant_id, status, issued_at DESC);
