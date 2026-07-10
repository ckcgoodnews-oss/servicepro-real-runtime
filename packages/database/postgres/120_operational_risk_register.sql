-- Sprint 120 PostgreSQL migration: operational risk register runtime.

CREATE TABLE IF NOT EXISTS operational_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  risk_number text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  category text NOT NULL DEFAULT 'operational',
  owner text NOT NULL DEFAULT '',
  business_unit text NOT NULL DEFAULT '',
  inherent_likelihood integer NOT NULL DEFAULT 3,
  inherent_impact integer NOT NULL DEFAULT 3,
  inherent_score integer NOT NULL DEFAULT 9,
  inherent_level text NOT NULL DEFAULT 'medium',
  residual_likelihood integer NOT NULL DEFAULT 3,
  residual_impact integer NOT NULL DEFAULT 3,
  residual_score integer NOT NULL DEFAULT 9,
  residual_level text NOT NULL DEFAULT 'medium',
  identified_at timestamptz NOT NULL,
  next_review_at timestamptz,
  closed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS risk_mitigation_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
  owner text NOT NULL DEFAULT '',
  due_at timestamptz,
  completed_at timestamptz,
  expected_residual_likelihood integer,
  expected_residual_impact integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS risk_kris (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'unknown',
  current_value numeric(18,4),
  warning_threshold numeric(18,4),
  breach_threshold numeric(18,4),
  operator text NOT NULL DEFAULT 'gte',
  observed_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS risk_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'scheduled',
  reviewer text NOT NULL DEFAULT '',
  scheduled_at timestamptz NOT NULL,
  completed_at timestamptz,
  notes text NOT NULL DEFAULT '',
  residual_likelihood integer,
  residual_impact integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS risk_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  reason text NOT NULL,
  requested_by text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL,
  approved_by text NOT NULL DEFAULT '',
  approved_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_operational_risks_tenant_status ON operational_risks (tenant_id, status, residual_level, next_review_at);
CREATE INDEX IF NOT EXISTS idx_risk_mitigation_risk_status ON risk_mitigation_plans (risk_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_risk_kris_risk_status ON risk_kris (risk_id, status, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_reviews_risk_status ON risk_reviews (risk_id, status, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_acceptances_risk_status ON risk_acceptances (risk_id, status, expires_at);
