-- Sprint 53 PostgreSQL migration: repository runtime operational metadata.

CREATE TABLE IF NOT EXISTS repository_runtime_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  repository_name text NOT NULL,
  operation_name text NOT NULL,
  status text NOT NULL DEFAULT 'success',
  duration_ms integer,
  error_message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_repository_runtime_events_tenant_repo_time
ON repository_runtime_events (tenant_id, repository_name, created_at DESC);
