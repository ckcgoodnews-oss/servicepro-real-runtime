-- Sprint 86 PostgreSQL migration: payroll periods and export batches.

CREATE TABLE IF NOT EXISTS payroll_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'open',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payroll_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  period_id uuid,
  start_date date NOT NULL,
  end_date date NOT NULL,
  format text NOT NULL DEFAULT 'json',
  status text NOT NULL DEFAULT 'draft',
  item_count integer NOT NULL DEFAULT 0,
  total_hours numeric(12,2) NOT NULL DEFAULT 0,
  total_labor_cost numeric(12,2) NOT NULL DEFAULT 0,
  export_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  approved_by text NOT NULL DEFAULT '',
  approved_at timestamptz,
  exported_at timestamptz,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payroll_periods_tenant_dates
ON payroll_periods (tenant_id, start_date DESC, end_date DESC);

CREATE INDEX IF NOT EXISTS idx_payroll_exports_tenant_period
ON payroll_exports (tenant_id, period_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payroll_exports_tenant_status
ON payroll_exports (tenant_id, status, created_at DESC);
