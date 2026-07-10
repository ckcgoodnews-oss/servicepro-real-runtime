-- Sprint 102 PostgreSQL migration: compliance evidence runtime.

CREATE TABLE IF NOT EXISTS compliance_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  version text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS compliance_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  framework_id uuid NOT NULL,
  control_code text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  owner_team text NOT NULL DEFAULT 'platform',
  frequency text NOT NULL DEFAULT 'quarterly',
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, framework_id, control_code)
);

CREATE TABLE IF NOT EXISTS evidence_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  period_start date,
  period_end date,
  owner_team text NOT NULL DEFAULT 'platform',
  locked boolean NOT NULL DEFAULT false,
  locked_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS evidence_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  package_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  evidence_type text NOT NULL DEFAULT 'document',
  source_system text NOT NULL DEFAULT '',
  artifact_uri text NOT NULL DEFAULT '',
  collected_by text NOT NULL DEFAULT '',
  collected_at timestamptz NOT NULL,
  reviewed_by text NOT NULL DEFAULT '',
  reviewed_at timestamptz,
  expires_at timestamptz,
  status text NOT NULL DEFAULT 'collected',
  hash text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS control_evidence_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  control_id uuid NOT NULL,
  evidence_item_id uuid NOT NULL,
  relevance text NOT NULL DEFAULT 'primary',
  notes text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, control_id, evidence_item_id)
);

CREATE TABLE IF NOT EXISTS compliance_attestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  package_id uuid NOT NULL,
  attested_by text NOT NULL,
  attested_at timestamptz NOT NULL,
  statement text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'submitted',
  approved_by text NOT NULL DEFAULT '',
  approved_at timestamptz,
  rejected_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  package_id uuid NOT NULL,
  export_format text NOT NULL DEFAULT 'zip',
  status text NOT NULL DEFAULT 'queued',
  requested_by text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL,
  completed_at timestamptz,
  artifact_uri text NOT NULL DEFAULT '',
  failure_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_compliance_controls_tenant_framework
ON compliance_controls (tenant_id, framework_id, status);

CREATE INDEX IF NOT EXISTS idx_evidence_items_tenant_package
ON evidence_items (tenant_id, package_id, status);

CREATE INDEX IF NOT EXISTS idx_control_evidence_mappings_tenant_control
ON control_evidence_mappings (tenant_id, control_id);

CREATE INDEX IF NOT EXISTS idx_compliance_attestations_tenant_package
ON compliance_attestations (tenant_id, package_id, status);

CREATE INDEX IF NOT EXISTS idx_evidence_exports_tenant_package
ON evidence_exports (tenant_id, package_id, status);
