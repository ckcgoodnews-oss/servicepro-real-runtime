-- Sprint 148 PostgreSQL migration: billing and monetization.

CREATE TABLE IF NOT EXISTS billing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  billing_interval text NOT NULL DEFAULT 'monthly',
  currency text NOT NULL DEFAULT 'USD',
  price_cents integer NOT NULL DEFAULT 0,
  trial_days integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT '',
  plan_id uuid NOT NULL,
  key text NOT NULL,
  value_type text NOT NULL DEFAULT 'boolean',
  value jsonb NOT NULL DEFAULT 'true'::jsonb,
  description text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_tenant_id text NOT NULL,
  plan_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'trialing',
  started_at timestamptz NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancelled_at timestamptz,
  cancel_reason text NOT NULL DEFAULT '',
  payment_method_ref text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_tenant_id text NOT NULL,
  subscription_id uuid,
  invoice_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  currency text NOT NULL DEFAULT 'USD',
  subtotal_cents integer NOT NULL DEFAULT 0,
  tax_cents integer NOT NULL DEFAULT 0,
  discount_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  balance_due_cents integer NOT NULL DEFAULT 0,
  issued_at timestamptz,
  due_at timestamptz,
  paid_at timestamptz,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  invoice_id uuid NOT NULL,
  customer_tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  provider text NOT NULL DEFAULT '',
  provider_payment_id text NOT NULL DEFAULT '',
  attempted_at timestamptz NOT NULL,
  succeeded_at timestamptz,
  failure_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_tenant_id text NOT NULL,
  invoice_id uuid,
  status text NOT NULL DEFAULT 'available',
  amount_cents integer NOT NULL DEFAULT 0,
  remaining_cents integer NOT NULL DEFAULT 0,
  reason text NOT NULL DEFAULT '',
  issued_at timestamptz NOT NULL,
  expires_at timestamptz,
  applied_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_dunning (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  invoice_id uuid NOT NULL,
  customer_tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'scheduled',
  attempt_number integer NOT NULL DEFAULT 1,
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz,
  resolved_at timestamptz,
  message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_plans_tenant_status ON billing_plans (tenant_id, status, billing_interval);
CREATE INDEX IF NOT EXISTS idx_billing_entitlements_plan_key ON billing_entitlements (plan_id, key);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_customer_status ON billing_subscriptions (customer_tenant_id, status, current_period_end);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_customer_status ON billing_invoices (customer_tenant_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_billing_payments_invoice_status ON billing_payments (invoice_id, status, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_credits_customer_status ON billing_credits (customer_tenant_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_billing_dunning_invoice_status ON billing_dunning (invoice_id, status, scheduled_at);
