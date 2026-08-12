BEGIN;

CREATE TABLE IF NOT EXISTS payment_receipt_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  payment_id uuid NOT NULL,
  invoice_id uuid NOT NULL,
  customer_id uuid,
  recipient text NOT NULL DEFAULT '',
  status text NOT NULL CHECK (status IN ('sent','failed','skipped')),
  provider_message_id text NOT NULL DEFAULT '',
  error_code text NOT NULL DEFAULT '',
  error_message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id,payment_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_receipts_tenant_invoice ON payment_receipt_deliveries(tenant_id,invoice_id);

COMMIT;
