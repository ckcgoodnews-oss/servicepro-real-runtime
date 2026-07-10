-- Sprint 46 PostgreSQL migration: CRM automation, campaigns, follow-ups, reputation, referrals, and workflow engine.

CREATE TABLE IF NOT EXISTS lead_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  source_type text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  source_id uuid,
  status text NOT NULL DEFAULT 'new',
  first_name text,
  last_name text,
  company_name text,
  email text,
  phone text,
  service_needed text,
  problem_description text,
  score integer NOT NULL DEFAULT 0,
  converted_customer_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lead_scoring_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  condition_key text NOT NULL,
  condition_value text NOT NULL,
  score_delta integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  channel text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  audience_definition jsonb NOT NULL DEFAULT '{}'::jsonb,
  message_template_id uuid,
  scheduled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  campaign_id uuid NOT NULL,
  customer_id uuid,
  lead_id uuid,
  status text NOT NULL DEFAULT 'queued',
  sent_at timestamptz,
  responded_at timestamptz,
  error_message text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS follow_up_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  customer_id uuid,
  lead_id uuid,
  reason text NOT NULL,
  due_at timestamptz NOT NULL,
  assigned_user_id uuid,
  status text NOT NULL DEFAULT 'open',
  notes text NOT NULL DEFAULT '',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  job_id uuid,
  platform text NOT NULL DEFAULT 'google',
  request_channel text NOT NULL DEFAULT 'email',
  status text NOT NULL DEFAULT 'queued',
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  platform text NOT NULL,
  rating integer NOT NULL,
  review_text text,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  reward_type text NOT NULL,
  reward_amount numeric(12,2) NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  program_id uuid NOT NULL,
  referring_customer_id uuid NOT NULL,
  referred_lead_id uuid,
  referred_customer_id uuid,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  rewarded_at timestamptz
);

CREATE TABLE IF NOT EXISTS workflow_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  trigger_definition jsonb NOT NULL DEFAULT '{}'::jsonb,
  action_definitions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_execution_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  workflow_id uuid NOT NULL,
  trigger_event_id uuid,
  status text NOT NULL DEFAULT 'running',
  input_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  error_message text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_tenant_status
ON crm_leads (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_tenant_due
ON follow_up_tasks (tenant_id, status, due_at);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign
ON campaign_recipients (tenant_id, campaign_id, status);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_tenant_status
ON workflow_execution_runs (tenant_id, status, started_at DESC);
