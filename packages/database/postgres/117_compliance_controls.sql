-- Sprint 117 PostgreSQL migration: compliance control mapping runtime.

CREATE TABLE IF NOT EXISTS compliance_mapping_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  version text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  owner text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_mapping_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid NOT NULL,
  control_code text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  owner text NOT NULL DEFAULT '',
  frequency text NOT NULL DEFAULT 'quarterly',
  category text NOT NULL DEFAULT '',
  automated boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_evidence_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id uuid NOT NULL,
  title text NOT NULL,
  evidence_type text NOT NULL DEFAULT 'document',
  source_system text NOT NULL DEFAULT '',
  source_id text NOT NULL DEFAULT '',
  uri text NOT NULL DEFAULT '',
  collected_by text NOT NULL DEFAULT '',
  collected_at timestamptz NOT NULL,
  valid_until timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'planned',
  tested_by text NOT NULL DEFAULT '',
  planned_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  result_summary text NOT NULL DEFAULT '',
  sample_size integer NOT NULL DEFAULT 0,
  exceptions_found integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id uuid NOT NULL,
  test_run_id uuid,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  owner text NOT NULL DEFAULT '',
  due_at timestamptz,
  closed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_corrective_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gap_id uuid NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_compliance_mapping_frameworks_status ON compliance_mapping_frameworks (status, name);
CREATE INDEX IF NOT EXISTS idx_compliance_mapping_controls_framework_status ON compliance_mapping_controls (framework_id, status, control_code);
CREATE INDEX IF NOT EXISTS idx_compliance_evidence_control ON compliance_evidence_mappings (control_id, collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_tests_control_status ON compliance_test_runs (control_id, status, planned_at DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_gaps_control_status ON compliance_gaps (control_id, status, severity, due_at);
CREATE INDEX IF NOT EXISTS idx_compliance_actions_gap_status ON compliance_corrective_actions (gap_id, status, due_at);
