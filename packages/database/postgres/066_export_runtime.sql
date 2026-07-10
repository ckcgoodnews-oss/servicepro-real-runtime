-- Sprint 66 PostgreSQL migration: export runtime audit.

CREATE TABLE IF NOT EXISTS export_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  export_key text NOT NULL,
  filename text NOT NULL,
  row_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'success',
  created_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_export_runs_tenant_time
ON export_runs (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_export_runs_tenant_key
ON export_runs (tenant_id, export_key, created_at DESC);
