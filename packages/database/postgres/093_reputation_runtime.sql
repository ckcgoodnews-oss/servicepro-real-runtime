-- Sprint 93 PostgreSQL migration: review and reputation management.

CREATE TABLE IF NOT EXISTS review_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  platform text NOT NULL DEFAULT 'custom',
  review_url text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 100,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS review_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  trigger_type text NOT NULL DEFAULT 'survey.promoter',
  min_survey_rating numeric(8,2) NOT NULL DEFAULT 4,
  min_nps_score integer NOT NULL DEFAULT 9,
  suppress_below_rating numeric(8,2) NOT NULL DEFAULT 4,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_id uuid NOT NULL,
  job_id uuid,
  survey_response_id uuid,
  review_site_id uuid NOT NULL,
  campaign_id uuid,
  status text NOT NULL DEFAULT 'queued',
  token text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  sent_at timestamptz,
  clicked_at timestamptz,
  completed_at timestamptz,
  suppressed_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, token)
);

CREATE TABLE IF NOT EXISTS review_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_id uuid NOT NULL,
  job_id uuid,
  review_request_id uuid,
  platform text NOT NULL,
  external_review_id text NOT NULL DEFAULT '',
  rating numeric(8,2) NOT NULL DEFAULT 0,
  sentiment text NOT NULL DEFAULT 'neutral',
  status text NOT NULL DEFAULT 'new',
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  review_url text NOT NULL DEFAULT '',
  received_at timestamptz NOT NULL,
  response_text text NOT NULL DEFAULT '',
  responded_at timestamptz,
  escalated_at timestamptz,
  escalation_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_sites_tenant_active
ON review_sites (tenant_id, active, priority);

CREATE INDEX IF NOT EXISTS idx_review_requests_tenant_customer
ON review_requests (tenant_id, customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_review_requests_tenant_job
ON review_requests (tenant_id, job_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_review_captures_tenant_customer
ON review_captures (tenant_id, customer_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_review_captures_tenant_status
ON review_captures (tenant_id, status, received_at DESC);
