-- Sprint 51 PostgreSQL migration: runtime persistence metadata.

CREATE TABLE IF NOT EXISTS runtime_store_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text NOT NULL,
  storage_type text NOT NULL DEFAULT 'json',
  record_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS runtime_validation_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  entity_type text NOT NULL,
  validation_code text NOT NULL,
  message text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_runtime_validation_failures_tenant_time
ON runtime_validation_failures (tenant_id, created_at DESC);
