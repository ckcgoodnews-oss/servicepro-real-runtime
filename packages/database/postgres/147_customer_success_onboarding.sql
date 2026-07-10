-- Sprint 147 PostgreSQL migration: customer success and onboarding.

CREATE TABLE IF NOT EXISTS customer_launch_cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
  launch_date text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  customer_tenant_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_onboarding_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_tenant_id text NOT NULL,
  cohort_id uuid,
  customer_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_started',
  owner text NOT NULL DEFAULT '',
  started_at timestamptz,
  target_completion_at timestamptz,
  completed_at timestamptz,
  blocker_summary text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_onboarding_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT '',
  plan_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  owner text NOT NULL DEFAULT '',
  sequence integer NOT NULL DEFAULT 1,
  due_at timestamptz,
  completed_at timestamptz,
  blocker_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_adoption_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_tenant_id text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric(18,4) NOT NULL DEFAULT 0,
  target_value numeric(18,4),
  period text NOT NULL DEFAULT 'weekly',
  measured_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_tenant_id text NOT NULL,
  feedback_type text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'new',
  severity text NOT NULL DEFAULT 'medium',
  summary text NOT NULL,
  details text NOT NULL DEFAULT '',
  submitted_by text NOT NULL DEFAULT '',
  submitted_at timestamptz NOT NULL,
  reviewed_by text NOT NULL DEFAULT '',
  reviewed_at timestamptz,
  resolution text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_tenant_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  severity text NOT NULL DEFAULT 'medium',
  owner text NOT NULL DEFAULT '',
  opened_at timestamptz NOT NULL,
  resolved_at timestamptz,
  closed_at timestamptz,
  resolution text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_success_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_tenant_id text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  objectives jsonb NOT NULL DEFAULT '[]'::jsonb,
  risks jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_business_review_at timestamptz,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_launch_cohorts_tenant_status ON customer_launch_cohorts (tenant_id, status, launch_date);
CREATE INDEX IF NOT EXISTS idx_customer_onboarding_plans_tenant_status ON customer_onboarding_plans (tenant_id, status, customer_tenant_id);
CREATE INDEX IF NOT EXISTS idx_customer_onboarding_tasks_plan_status ON customer_onboarding_tasks (plan_id, status, sequence);
CREATE INDEX IF NOT EXISTS idx_customer_adoption_metrics_customer ON customer_adoption_metrics (customer_tenant_id, metric_name, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_tenant_status ON customer_feedback (tenant_id, status, severity, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_escalations_tenant_status ON customer_escalations (tenant_id, status, severity, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_success_plans_tenant_status ON customer_success_plans (tenant_id, status, customer_tenant_id);
