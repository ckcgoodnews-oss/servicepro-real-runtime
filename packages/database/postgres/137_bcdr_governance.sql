-- Sprint 137 PostgreSQL migration: BCDR governance.

CREATE TABLE IF NOT EXISTS bcdr_bias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  process_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  criticality text NOT NULL DEFAULT 'medium',
  owner text NOT NULL DEFAULT '',
  business_unit text NOT NULL DEFAULT '',
  max_tolerable_downtime_hours numeric(10,2) NOT NULL DEFAULT 24,
  rto_hours numeric(10,2) NOT NULL DEFAULT 8,
  rpo_hours numeric(10,2) NOT NULL DEFAULT 4,
  dependencies jsonb NOT NULL DEFAULT '[]'::jsonb,
  impact_summary text NOT NULL DEFAULT '',
  reviewed_at timestamptz,
  approved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bcdr_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bia_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  version text NOT NULL DEFAULT '1.0',
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  recovery_strategy text NOT NULL DEFAULT '',
  runbook_url text NOT NULL DEFAULT '',
  rto_hours numeric(10,2) NOT NULL DEFAULT 8,
  rpo_hours numeric(10,2) NOT NULL DEFAULT 4,
  last_tested_at timestamptz,
  next_test_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bcdr_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  bia_id uuid,
  tenant_id text NOT NULL DEFAULT '',
  approver_id text NOT NULL,
  approver_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL,
  responded_at timestamptz,
  comments text NOT NULL DEFAULT '',
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bcdr_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  bia_id uuid,
  tenant_id text NOT NULL DEFAULT '',
  name text NOT NULL,
  exercise_type text NOT NULL DEFAULT 'tabletop',
  status text NOT NULL DEFAULT 'planned',
  owner text NOT NULL DEFAULT '',
  scheduled_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  achieved_rto_hours numeric(10,2),
  achieved_rpo_hours numeric(10,2),
  outcome_summary text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bcdr_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL,
  plan_id uuid,
  tenant_id text NOT NULL DEFAULT '',
  evidence_type text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  file_url text NOT NULL DEFAULT '',
  collected_by text NOT NULL DEFAULT '',
  collected_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bcdr_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  exercise_id uuid,
  tenant_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  severity text NOT NULL DEFAULT 'medium',
  owner text NOT NULL DEFAULT '',
  due_at timestamptz,
  completed_at timestamptz,
  accepted_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bcdr_bias_tenant_status ON bcdr_bias (tenant_id, status, criticality);
CREATE INDEX IF NOT EXISTS idx_bcdr_plans_bia_status ON bcdr_plans (bia_id, status, next_test_at);
CREATE INDEX IF NOT EXISTS idx_bcdr_approvals_plan_status ON bcdr_approvals (plan_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_bcdr_exercises_plan_status ON bcdr_exercises (plan_id, status, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_bcdr_evidence_exercise ON bcdr_evidence (exercise_id, evidence_type);
CREATE INDEX IF NOT EXISTS idx_bcdr_gaps_plan_status ON bcdr_gaps (plan_id, status, severity, due_at);
