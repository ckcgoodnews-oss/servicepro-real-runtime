-- Sprint 92 PostgreSQL migration: customer surveys, sends, and responses.

CREATE TABLE IF NOT EXISTS survey_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  trigger_type text NOT NULL DEFAULT 'job.completed',
  active boolean NOT NULL DEFAULT true,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS survey_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  template_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  entity_type text NOT NULL DEFAULT 'customer',
  entity_id text NOT NULL,
  job_id uuid,
  invoice_id uuid,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'queued',
  token text NOT NULL,
  sent_at timestamptz,
  opened_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, token)
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  survey_send_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  entity_type text NOT NULL DEFAULT 'customer',
  entity_id text NOT NULL,
  job_id uuid,
  invoice_id uuid,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  csat_score numeric(8,2) NOT NULL DEFAULT 0,
  nps_score integer,
  nps_category text NOT NULL DEFAULT '',
  comment text NOT NULL DEFAULT '',
  submitted_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_survey_templates_tenant_active
ON survey_templates (tenant_id, active, trigger_type);

CREATE INDEX IF NOT EXISTS idx_survey_sends_tenant_customer
ON survey_sends (tenant_id, customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_survey_sends_tenant_entity
ON survey_sends (tenant_id, entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_survey_responses_tenant_customer
ON survey_responses (tenant_id, customer_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_survey_responses_tenant_entity
ON survey_responses (tenant_id, entity_type, entity_id, submitted_at DESC);
