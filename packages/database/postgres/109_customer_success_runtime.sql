-- Sprint 109 PostgreSQL migration: customer success and account management runtime.

CREATE TABLE IF NOT EXISTS customer_success_account_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  account_name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  success_manager text NOT NULL DEFAULT '',
  executive_sponsor text NOT NULL DEFAULT '',
  health_score numeric(8,2) NOT NULL DEFAULT 70,
  renewal_date date,
  goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  risks jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_success_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_plan_id uuid NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_started',
  target_date date,
  completed_at timestamptz,
  owner text NOT NULL DEFAULT '',
  weight numeric(8,2) NOT NULL DEFAULT 1,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_success_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_plan_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  owner text NOT NULL DEFAULT '',
  due_date date,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_success_qbrs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_plan_id uuid NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'planned',
  scheduled_at timestamptz,
  completed_at timestamptz,
  attendees jsonb NOT NULL DEFAULT '[]'::jsonb,
  agenda jsonb NOT NULL DEFAULT '[]'::jsonb,
  outcomes jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_success_renewal_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_plan_id uuid NOT NULL,
  risk_level text NOT NULL DEFAULT 'medium',
  reason text NOT NULL,
  mitigation_plan text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  opened_at timestamptz NOT NULL,
  resolved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cs_account_plans_tenant_status ON customer_success_account_plans (tenant_id, status, account_name);
CREATE INDEX IF NOT EXISTS idx_cs_milestones_plan_status ON customer_success_milestones (account_plan_id, status, target_date);
CREATE INDEX IF NOT EXISTS idx_cs_tasks_plan_status ON customer_success_tasks (account_plan_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_cs_qbrs_plan_status ON customer_success_qbrs (account_plan_id, status, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_cs_risks_plan_level ON customer_success_renewal_risks (account_plan_id, risk_level, opened_at DESC);
