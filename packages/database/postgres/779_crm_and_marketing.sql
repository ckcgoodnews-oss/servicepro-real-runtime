BEGIN;

-- CRM Leads
CREATE TABLE IF NOT EXISTS crm_leads (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'manual',
  stage text NOT NULL DEFAULT 'new',
  value bigint NOT NULL DEFAULT 0,
  service text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  assigned_to text NOT NULL DEFAULT '',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_contact_at timestamptz,
  converted_at timestamptz,
  lost_reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crm_leads_tenant_stage_idx ON crm_leads (tenant_id, stage);
CREATE INDEX IF NOT EXISTS crm_leads_tenant_source_idx ON crm_leads (tenant_id, source);

-- Marketing Campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'email',
  status text NOT NULL DEFAULT 'draft',
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  audience text NOT NULL DEFAULT 'all_customers',
  audience_filter jsonb NOT NULL DEFAULT '{}'::jsonb,
  scheduled_at timestamptz,
  sent_count int NOT NULL DEFAULT 0,
  opened_count int NOT NULL DEFAULT 0,
  clicked_count int NOT NULL DEFAULT 0,
  converted_count int NOT NULL DEFAULT 0,
  created_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketing_campaigns_tenant_status_idx ON marketing_campaigns (tenant_id, status);

-- Payment records
CREATE TABLE IF NOT EXISTS payment_records (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  invoice_id text NOT NULL DEFAULT '',
  amount_cents bigint NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'card',
  status text NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id text NOT NULL DEFAULT '',
  stripe_refund_id text NOT NULL DEFAULT '',
  refunded_amount_cents bigint NOT NULL DEFAULT 0,
  refund_reason text NOT NULL DEFAULT '',
  processed_by text NOT NULL DEFAULT '',
  completed_at timestamptz,
  refunded_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_records_tenant_invoice_idx ON payment_records (tenant_id, invoice_id);
CREATE INDEX IF NOT EXISTS payment_records_tenant_status_idx ON payment_records (tenant_id, status);

COMMIT;
