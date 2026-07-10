-- Sprint 29 PostgreSQL migration: tenant data imports, migration batches, and data quality.

CREATE TABLE IF NOT EXISTS tenant_import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  import_type text NOT NULL,
  source_name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  dry_run boolean NOT NULL DEFAULT true,
  requested_by uuid,
  started_at timestamptz,
  finished_at timestamptz,
  total_rows integer NOT NULL DEFAULT 0,
  valid_rows integer NOT NULL DEFAULT 0,
  invalid_rows integer NOT NULL DEFAULT 0,
  duplicate_rows integer NOT NULL DEFAULT 0,
  error_message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS import_mapping_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  import_type text NOT NULL,
  source_columns jsonb NOT NULL DEFAULT '[]'::jsonb,
  field_mappings jsonb NOT NULL DEFAULT '{}'::jsonb,
  default_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  import_job_id uuid NOT NULL,
  batch_number integer NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  row_start integer NOT NULL,
  row_end integer NOT NULL,
  rows_processed integer NOT NULL DEFAULT 0,
  rows_failed integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE TABLE IF NOT EXISTS import_row_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  import_job_id uuid NOT NULL,
  batch_id uuid,
  row_number integer NOT NULL,
  field_name text,
  error_code text NOT NULL,
  error_message text NOT NULL,
  raw_row jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS duplicate_detection_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  entity_type text NOT NULL,
  rule_name text NOT NULL,
  match_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  threshold numeric(6,4) NOT NULL DEFAULT 1.0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS duplicate_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  entity_type text NOT NULL,
  import_job_id uuid,
  source_row_number integer,
  existing_entity_id uuid,
  match_score numeric(6,4) NOT NULL DEFAULT 0,
  match_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolution_status text NOT NULL DEFAULT 'unresolved',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS data_quality_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  issue_type text NOT NULL,
  severity text NOT NULL DEFAULT 'warning',
  message text NOT NULL,
  suggested_fix text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  detected_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS import_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  import_job_id uuid,
  actor_id uuid,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_import_jobs_tenant_status
ON tenant_import_jobs (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_import_row_errors_job
ON import_row_errors (tenant_id, import_job_id, row_number);

CREATE INDEX IF NOT EXISTS idx_duplicate_candidates_tenant_status
ON duplicate_candidates (tenant_id, entity_type, resolution_status);

CREATE INDEX IF NOT EXISTS idx_data_quality_issues_tenant_status
ON data_quality_issues (tenant_id, status, severity);
