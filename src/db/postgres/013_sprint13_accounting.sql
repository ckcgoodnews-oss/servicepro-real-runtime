-- Sprint 13 PostgreSQL migration: accounting exports and reconciliation.

CREATE TABLE IF NOT EXISTS tenant_accounting_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE,
  default_tax_rate numeric(8,6) NOT NULL DEFAULT 0,
  accounting_basis text NOT NULL DEFAULT 'cash',
  export_format text NOT NULL DEFAULT 'csv',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  invoice_id uuid,
  method text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  received_at timestamptz NOT NULL DEFAULT now(),
  external_reference text,
  reconciled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_tenant_invoice
ON invoice_payments (tenant_id, invoice_id);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_tenant_customer
ON invoice_payments (tenant_id, customer_id);
