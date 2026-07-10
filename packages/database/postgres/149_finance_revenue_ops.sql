-- Sprint 149 PostgreSQL migration: finance operations and revenue recognition.

CREATE TABLE IF NOT EXISTS finance_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  starts_at timestamptz,
  ends_at timestamptz,
  locked_at timestamptz,
  closed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_revenue_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  invoice_id text NOT NULL,
  customer_tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  amount_cents integer NOT NULL DEFAULT 0,
  recognized_cents integer NOT NULL DEFAULT 0,
  deferred_cents integer NOT NULL DEFAULT 0,
  period_start text NOT NULL DEFAULT '',
  period_end text NOT NULL DEFAULT '',
  recognition_method text NOT NULL DEFAULT 'straight_line',
  recognized_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_tax_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_tenant_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  country text NOT NULL DEFAULT 'US',
  region text NOT NULL DEFAULT '',
  tax_id text NOT NULL DEFAULT '',
  tax_exempt boolean NOT NULL DEFAULT false,
  tax_rate_bps integer NOT NULL DEFAULT 0,
  validated_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  payment_id text NOT NULL,
  invoice_id text NOT NULL DEFAULT '',
  customer_tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'requested',
  amount_cents integer NOT NULL DEFAULT 0,
  reason text NOT NULL DEFAULT '',
  requested_by text NOT NULL DEFAULT '',
  approved_by text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL,
  approved_at timestamptz,
  processed_at timestamptz,
  provider_refund_id text NOT NULL DEFAULT '',
  failure_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  payout_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  currency text NOT NULL DEFAULT 'USD',
  amount_cents integer NOT NULL DEFAULT 0,
  payment_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  approved_by text NOT NULL DEFAULT '',
  approved_at timestamptz,
  paid_at timestamptz,
  failure_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  account_code text NOT NULL,
  entry_type text NOT NULL DEFAULT 'debit',
  status text NOT NULL DEFAULT 'draft',
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  source_type text NOT NULL DEFAULT '',
  source_id text NOT NULL DEFAULT '',
  memo text NOT NULL DEFAULT '',
  posted_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS finance_reconciliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL DEFAULT 'Finance Reconciliation',
  status text NOT NULL DEFAULT 'queued',
  started_at timestamptz,
  completed_at timestamptz,
  expected_cents integer NOT NULL DEFAULT 0,
  actual_cents integer NOT NULL DEFAULT 0,
  difference_cents integer NOT NULL DEFAULT 0,
  failure_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_finance_periods_tenant_status ON finance_periods (tenant_id, status, starts_at);
CREATE INDEX IF NOT EXISTS idx_finance_revenue_schedules_tenant_status ON finance_revenue_schedules (tenant_id, status, customer_tenant_id);
CREATE INDEX IF NOT EXISTS idx_finance_tax_profiles_customer ON finance_tax_profiles (customer_tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_finance_refunds_tenant_status ON finance_refunds (tenant_id, status, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_finance_payouts_tenant_status ON finance_payouts (tenant_id, status, paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_finance_ledger_tenant_account ON finance_ledger_entries (tenant_id, account_code, status, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_finance_reconciliations_tenant_status ON finance_reconciliations (tenant_id, status, completed_at DESC);
