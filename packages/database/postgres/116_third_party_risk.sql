-- Sprint 116 PostgreSQL migration: third-party risk management runtime.

CREATE TABLE IF NOT EXISTS tpr_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  vendor_code text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  criticality text NOT NULL DEFAULT 'medium',
  owner text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  services_provided jsonb NOT NULL DEFAULT '[]'::jsonb,
  data_access jsonb NOT NULL DEFAULT '[]'::jsonb,
  contract_id text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tpr_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  assessment_type text NOT NULL DEFAULT 'security',
  requested_by text NOT NULL DEFAULT '',
  started_at timestamptz NOT NULL,
  due_at timestamptz,
  completed_at timestamptz,
  score numeric(8,2) NOT NULL DEFAULT 0,
  summary text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tpr_questionnaire_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL,
  question_key text NOT NULL,
  question_text text NOT NULL DEFAULT '',
  answer text NOT NULL DEFAULT '',
  answered_by text NOT NULL DEFAULT '',
  answered_at timestamptz NOT NULL,
  evidence_url text NOT NULL DEFAULT '',
  risk_points numeric(8,2) NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tpr_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  assessment_id uuid,
  tenant_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  due_at timestamptz,
  closed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tpr_remediation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id uuid NOT NULL,
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

CREATE TABLE IF NOT EXISTS tpr_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id uuid NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_tpr_vendors_tenant_status ON tpr_vendors (tenant_id, status, criticality);
CREATE INDEX IF NOT EXISTS idx_tpr_assessments_vendor_status ON tpr_assessments (vendor_id, status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_tpr_responses_assessment ON tpr_questionnaire_responses (assessment_id, question_key);
CREATE INDEX IF NOT EXISTS idx_tpr_findings_tenant_status_severity ON tpr_findings (tenant_id, status, severity, due_at);
CREATE INDEX IF NOT EXISTS idx_tpr_findings_vendor_status ON tpr_findings (vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_tpr_remediation_finding_status ON tpr_remediation_tasks (finding_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_tpr_exceptions_finding_status ON tpr_exceptions (finding_id, status, expires_at);
