-- Sprint 145 PostgreSQL migration: production hardening and Release Candidate 1.

CREATE TABLE IF NOT EXISTS production_health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  component text NOT NULL DEFAULT 'api',
  status text NOT NULL DEFAULT 'unknown',
  checked_at timestamptz,
  latency_ms numeric(12,2),
  message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production_readiness_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  required boolean NOT NULL DEFAULT true,
  evidence_url text NOT NULL DEFAULT '',
  completed_at timestamptz,
  waiver_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production_release_gates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'quality',
  status text NOT NULL DEFAULT 'pending',
  required boolean NOT NULL DEFAULT true,
  evaluated_at timestamptz,
  evaluated_by text NOT NULL DEFAULT '',
  result_summary text NOT NULL DEFAULT '',
  waiver_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production_deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  release_version text NOT NULL,
  environment text NOT NULL DEFAULT 'production',
  status text NOT NULL DEFAULT 'planned',
  requested_by text NOT NULL DEFAULT '',
  approved_by text NOT NULL DEFAULT '',
  started_at timestamptz,
  completed_at timestamptz,
  commit_sha text NOT NULL DEFAULT '',
  artifact_url text NOT NULL DEFAULT '',
  rollback_version text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  backup_name text NOT NULL,
  backup_type text NOT NULL DEFAULT 'database',
  status text NOT NULL DEFAULT 'scheduled',
  storage_location text NOT NULL DEFAULT '',
  started_at timestamptz,
  completed_at timestamptz,
  verified_at timestamptz,
  verified_by text NOT NULL DEFAULT '',
  restore_tested boolean NOT NULL DEFAULT false,
  retention_expires_at timestamptz,
  failure_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production_runbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'operations',
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  title text NOT NULL,
  evidence_type text NOT NULL DEFAULT 'release',
  status text NOT NULL DEFAULT 'collected',
  file_url text NOT NULL DEFAULT '',
  collected_by text NOT NULL DEFAULT '',
  collected_at timestamptz NOT NULL,
  verified_by text NOT NULL DEFAULT '',
  verified_at timestamptz,
  rejection_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_production_health_tenant_status ON production_health_checks (tenant_id, status, component);
CREATE INDEX IF NOT EXISTS idx_production_readiness_tenant_status ON production_readiness_checks (tenant_id, status, required);
CREATE INDEX IF NOT EXISTS idx_production_gates_tenant_status ON production_release_gates (tenant_id, status, required);
CREATE INDEX IF NOT EXISTS idx_production_deployments_tenant_status ON production_deployments (tenant_id, environment, status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_production_backups_tenant_status ON production_backups (tenant_id, status, verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_production_runbooks_tenant_status ON production_runbooks (tenant_id, status, category);
CREATE INDEX IF NOT EXISTS idx_production_evidence_tenant_status ON production_evidence (tenant_id, status, evidence_type);
