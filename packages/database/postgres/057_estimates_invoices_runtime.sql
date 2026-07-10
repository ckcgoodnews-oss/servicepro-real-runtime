-- Sprint 57 PostgreSQL migration: estimates, invoices, and pricing runtime.

CREATE TABLE IF NOT EXISTS estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_id uuid NOT NULL,
  job_id uuid,
  status text NOT NULL DEFAULT 'draft',
  tax_rate numeric(8,6) NOT NULL DEFAULT 0,
  lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  tax numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  margin_percent numeric(8,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_id uuid NOT NULL,
  job_id uuid,
  status text NOT NULL DEFAULT 'draft',
  tax_rate numeric(8,6) NOT NULL DEFAULT 0,
  lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  tax numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  paid_amount numeric(12,2) NOT NULL DEFAULT 0,
  balance_due numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_calculation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text,
  entity_type text NOT NULL,
  entity_id uuid,
  subtotal numeric(12,2),
  tax numeric(12,2),
  total numeric(12,2),
  margin_percent numeric(8,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_estimates_tenant_status
ON estimates (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status
ON invoices (tenant_id, status, created_at DESC);
