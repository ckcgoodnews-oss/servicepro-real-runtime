-- Sprint 73 PostgreSQL migration: backup and recovery metadata.

CREATE TABLE IF NOT EXISTS backup_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'system',
  backup_type text NOT NULL,
  storage_uri text NOT NULL DEFAULT '',
  filename text NOT NULL DEFAULT '',
  size_bytes bigint NOT NULL DEFAULT 0,
  sha256 text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'created',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS restore_validation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'system',
  backup_run_id uuid,
  status text NOT NULL DEFAULT 'validated',
  issue_count integer NOT NULL DEFAULT 0,
  issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_backup_runs_tenant_time
ON backup_runs (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_backup_runs_status_time
ON backup_runs (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_restore_validation_runs_tenant_time
ON restore_validation_runs (tenant_id, created_at DESC);
