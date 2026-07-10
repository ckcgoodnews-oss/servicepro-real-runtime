-- Sprint 138 PostgreSQL migration: asset inventory and configuration compliance.

CREATE TABLE IF NOT EXISTS config_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  asset_tag text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'discovered',
  asset_type text NOT NULL DEFAULT 'other',
  criticality text NOT NULL DEFAULT 'medium',
  owner text NOT NULL DEFAULT '',
  business_unit text NOT NULL DEFAULT '',
  environment text NOT NULL DEFAULT 'prod',
  hostname text NOT NULL DEFAULT '',
  ip_address text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  discovered_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS config_baselines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  asset_type text NOT NULL DEFAULT '',
  environment text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  version text NOT NULL DEFAULT '1.0',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS config_baseline_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  baseline_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  key text NOT NULL,
  operator text NOT NULL DEFAULT 'eq',
  expected_value text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'medium',
  description text NOT NULL DEFAULT '',
  remediation_hint text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS config_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  baseline_id uuid,
  asset_id uuid,
  status text NOT NULL DEFAULT 'queued',
  requested_by text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  assets_scanned integer NOT NULL DEFAULT 0,
  findings_created integer NOT NULL DEFAULT 0,
  error_message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS config_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL,
  baseline_id uuid,
  rule_id uuid NOT NULL,
  scan_id uuid,
  tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  severity text NOT NULL DEFAULT 'medium',
  key text NOT NULL DEFAULT '',
  expected_value text NOT NULL DEFAULT '',
  actual_value text NOT NULL DEFAULT '',
  detected_at timestamptz NOT NULL,
  resolved_at timestamptz,
  accepted_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS config_remediations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id uuid NOT NULL,
  asset_id uuid,
  tenant_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  owner text NOT NULL DEFAULT '',
  due_at timestamptz,
  completed_at timestamptz,
  waiver_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_config_assets_tenant_status ON config_assets (tenant_id, status, asset_type, criticality);
CREATE INDEX IF NOT EXISTS idx_config_baselines_tenant_status ON config_baselines (tenant_id, status, asset_type);
CREATE INDEX IF NOT EXISTS idx_config_rules_baseline_enabled ON config_baseline_rules (baseline_id, enabled, severity);
CREATE INDEX IF NOT EXISTS idx_config_scans_tenant_status ON config_scans (tenant_id, status, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_config_findings_asset_status ON config_findings (asset_id, status, severity, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_config_remediations_finding_status ON config_remediations (finding_id, status, due_at);
