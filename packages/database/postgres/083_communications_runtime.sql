-- Sprint 83 PostgreSQL migration: communications timeline.

CREATE TABLE IF NOT EXISTS communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_id uuid NOT NULL,
  job_id uuid,
  estimate_id uuid,
  invoice_id uuid,
  payment_id uuid,
  agreement_id uuid,
  channel text NOT NULL DEFAULT 'internal_note',
  direction text NOT NULL DEFAULT 'internal',
  status text NOT NULL DEFAULT 'logged',
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  from_address text NOT NULL DEFAULT '',
  to_address text NOT NULL DEFAULT '',
  cc_address text NOT NULL DEFAULT '',
  bcc_address text NOT NULL DEFAULT '',
  external_message_id text NOT NULL DEFAULT '',
  template_key text NOT NULL DEFAULT '',
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  failure_reason text NOT NULL DEFAULT '',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_communications_tenant_customer
ON communications (tenant_id, customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_communications_tenant_job
ON communications (tenant_id, job_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_communications_tenant_invoice
ON communications (tenant_id, invoice_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_communications_tenant_status
ON communications (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_communications_external_message
ON communications (external_message_id);
