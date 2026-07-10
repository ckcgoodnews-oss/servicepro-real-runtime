-- Sprint 70 PostgreSQL migration: validation and integrity runtime.

CREATE TABLE IF NOT EXISTS integrity_check_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  status text NOT NULL DEFAULT 'passed',
  issue_count integer NOT NULL DEFAULT 0,
  issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integrity_check_runs_tenant_time
ON integrity_check_runs (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_integrity_check_runs_tenant_status
ON integrity_check_runs (tenant_id, status, created_at DESC);

ALTER TABLE invoices
  ADD CONSTRAINT IF NOT EXISTS invoices_nonnegative_total CHECK (total >= 0),
  ADD CONSTRAINT IF NOT EXISTS invoices_nonnegative_paid CHECK (paid_amount >= 0);

ALTER TABLE inventory_items
  ADD CONSTRAINT IF NOT EXISTS inventory_nonnegative_quantity CHECK (quantity_on_hand >= 0);
