-- Sprint 60 PostgreSQL migration: price-book PostgreSQL compatibility and indexes.

CREATE INDEX IF NOT EXISTS idx_estimates_tenant_customer
ON estimates (tenant_id, customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant_customer
ON invoices (tenant_id, customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_catalog_tenant_code
ON service_catalog (tenant_id, code);

CREATE INDEX IF NOT EXISTS idx_payments_tenant_customer
ON payments (tenant_id, customer_id, received_at DESC);

CREATE TABLE IF NOT EXISTS pricebook_runtime_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  check_name text NOT NULL,
  status text NOT NULL DEFAULT 'passed',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
