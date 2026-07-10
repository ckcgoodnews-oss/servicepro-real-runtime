-- Sprint 150 PostgreSQL migration: enterprise audit and compliance evidence.

CREATE TABLE IF NOT EXISTS audit_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  framework text NOT NULL DEFAULT 'SOC2',
  status text NOT NULL DEFAULT 'planned',
  owner text NOT NULL DEFAULT '',
  auditor text NOT NULL DEFAULT '',
  period_start text NOT NULL DEFAULT '',
  period_end text NOT NULL DEFAULT '',
  started_at timestamptz,
  closed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  program_id uuid,
  control_code text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  domain text NOT NULL DEFAULT 'security',
  owner text NOT NULL DEFAULT '',
  frequency text NOT NULL DEFAULT 'quarterly',
  risk_statement text NOT NULL DEFAULT '',
  control_objective text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_evidence_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  program_id uuid,
  control_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  requested_by text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  due_at timestamptz,
  submitted_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  request_id uuid NOT NULL,
  control_id uuid,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'uploaded',
  file_url text NOT NULL DEFAULT '',
  hash text NOT NULL DEFAULT '',
  uploaded_by text NOT NULL DEFAULT '',
  uploaded_at timestamptz NOT NULL,
  reviewed_by text NOT NULL DEFAULT '',
  reviewed_at timestamptz,
  rejection_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_control_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  program_id uuid,
  control_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'planned',
  tester text NOT NULL DEFAULT '',
  test_procedure text NOT NULL DEFAULT '',
  sample_size integer NOT NULL DEFAULT 0,
  exceptions_found integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  result_summary text NOT NULL DEFAULT '',
  waiver_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  program_id uuid,
  control_id uuid,
  test_id uuid,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  severity text NOT NULL DEFAULT 'medium',
  owner text NOT NULL DEFAULT '',
  opened_at timestamptz NOT NULL,
  due_at timestamptz,
  remediated_at timestamptz,
  closed_at timestamptz,
  accepted_risk_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_remediations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  finding_id uuid NOT NULL,
  summary text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
  owner text NOT NULL DEFAULT '',
  target_date timestamptz,
  completed_at timestamptz,
  blocker_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_attestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  program_id uuid NOT NULL,
  attestor text NOT NULL,
  title text NOT NULL DEFAULT 'Management Attestation',
  status text NOT NULL DEFAULT 'draft',
  statement text NOT NULL DEFAULT '',
  submitted_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_programs_tenant_status ON audit_programs (tenant_id, status, framework);
CREATE INDEX IF NOT EXISTS idx_audit_controls_tenant_status ON audit_controls (tenant_id, status, domain);
CREATE INDEX IF NOT EXISTS idx_audit_requests_control_status ON audit_evidence_requests (control_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_audit_artifacts_request_status ON audit_artifacts (request_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_tests_control_status ON audit_control_tests (control_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_findings_tenant_status ON audit_findings (tenant_id, status, severity, due_at);
CREATE INDEX IF NOT EXISTS idx_audit_remediations_finding_status ON audit_remediations (finding_id, status, target_date);
CREATE INDEX IF NOT EXISTS idx_audit_attestations_program_status ON audit_attestations (program_id, status);
