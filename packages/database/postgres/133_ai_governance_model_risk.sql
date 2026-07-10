-- Sprint 133 PostgreSQL migration: AI governance and model risk management.

CREATE TABLE IF NOT EXISTS ai_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  system_type text NOT NULL DEFAULT 'other',
  risk_tier text NOT NULL DEFAULT 'limited',
  owner text NOT NULL DEFAULT '',
  business_unit text NOT NULL DEFAULT '',
  vendor_name text NOT NULL DEFAULT '',
  model_name text NOT NULL DEFAULT '',
  model_version text NOT NULL DEFAULT '',
  use_case text NOT NULL DEFAULT '',
  data_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  user_impact text NOT NULL DEFAULT '',
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_system_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  assessor text NOT NULL DEFAULT '',
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  inherent_risk text NOT NULL DEFAULT 'limited',
  residual_risk text NOT NULL DEFAULT 'limited',
  bias_risk text NOT NULL DEFAULT 'unknown',
  privacy_risk text NOT NULL DEFAULT 'unknown',
  security_risk text NOT NULL DEFAULT 'unknown',
  explainability_notes text NOT NULL DEFAULT '',
  human_oversight boolean NOT NULL DEFAULT false,
  mitigation_plan text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL,
  ai_system_id uuid,
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

CREATE TABLE IF NOT EXISTS ai_monitoring_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_system_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  signal_name text NOT NULL,
  status text NOT NULL DEFAULT 'unknown',
  value text,
  numeric_value numeric(18,4),
  warning_threshold numeric(18,4),
  breach_threshold numeric(18,4),
  operator text NOT NULL DEFAULT 'gte',
  observed_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_system_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  severity text NOT NULL DEFAULT 'medium',
  reported_by text NOT NULL DEFAULT '',
  reported_at timestamptz NOT NULL,
  mitigated_at timestamptz,
  closed_at timestamptz,
  linked_incident_id text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_systems_tenant_status ON ai_systems (tenant_id, status, risk_tier, next_review_at);
CREATE INDEX IF NOT EXISTS idx_ai_assessments_system_status ON ai_assessments (ai_system_id, status, residual_risk);
CREATE INDEX IF NOT EXISTS idx_ai_approvals_assessment_status ON ai_approvals (assessment_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_signals_system_status ON ai_monitoring_signals (ai_system_id, status, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_incidents_system_status ON ai_incidents (ai_system_id, status, severity, reported_at DESC);
