-- Sprint 131 PostgreSQL migration: processing inventory and DPIA runtime.

CREATE TABLE IF NOT EXISTS processing_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  owner text NOT NULL DEFAULT '',
  business_unit text NOT NULL DEFAULT '',
  purpose text NOT NULL DEFAULT '',
  lawful_basis text NOT NULL DEFAULT 'legitimate_interest',
  data_subject_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  retention_policy_id text NOT NULL DEFAULT '',
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS processing_data_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  sensitivity text NOT NULL DEFAULT 'confidential',
  data_subject_type text NOT NULL DEFAULT 'customer',
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  special_category boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS processing_system_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  system_name text NOT NULL,
  system_owner text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  processing_role text NOT NULL DEFAULT 'controller',
  region text NOT NULL DEFAULT '',
  vendor_id text NOT NULL DEFAULT '',
  transfer_mechanism text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dpia_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  assessor text NOT NULL DEFAULT '',
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  inherent_risk text NOT NULL DEFAULT 'medium',
  residual_risk text NOT NULL DEFAULT 'medium',
  summary text NOT NULL DEFAULT '',
  necessity_assessment text NOT NULL DEFAULT '',
  proportionality_assessment text NOT NULL DEFAULT '',
  consultation_required boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dpia_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dpia_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  decision_type text NOT NULL DEFAULT 'approve',
  decided_by text NOT NULL,
  decided_at timestamptz NOT NULL,
  rationale text NOT NULL DEFAULT '',
  conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dpia_remediation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dpia_id uuid NOT NULL,
  activity_id uuid,
  tenant_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  owner text NOT NULL DEFAULT '',
  due_at timestamptz,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_processing_activities_tenant_status ON processing_activities (tenant_id, status, next_review_at);
CREATE INDEX IF NOT EXISTS idx_processing_categories_activity ON processing_data_categories (activity_id, sensitivity, special_category);
CREATE INDEX IF NOT EXISTS idx_processing_mappings_activity_status ON processing_system_mappings (activity_id, status, region);
CREATE INDEX IF NOT EXISTS idx_dpia_activity_status ON dpia_assessments (activity_id, status, residual_risk);
CREATE INDEX IF NOT EXISTS idx_dpia_decisions_dpia ON dpia_decisions (dpia_id, decided_at DESC);
CREATE INDEX IF NOT EXISTS idx_dpia_tasks_dpia_status ON dpia_remediation_tasks (dpia_id, status, due_at);
