-- Sprint 58 PostgreSQL migration: payment runtime.

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  invoice_id uuid NOT NULL,
  customer_id uuid,
  amount numeric(12,2) NOT NULL,
  method text NOT NULL DEFAULT 'manual',
  reference text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'posted',
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_application_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  payment_id uuid,
  invoice_id uuid,
  amount numeric(12,2) NOT NULL,
  previous_balance numeric(12,2),
  new_balance numeric(12,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_tenant_invoice
ON payments (tenant_id, invoice_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_application_events_tenant_invoice
ON payment_application_events (tenant_id, invoice_id, created_at DESC);
