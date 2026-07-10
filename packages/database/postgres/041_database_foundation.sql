-- Sprint 41 PostgreSQL migration: database operational metadata.

CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  name text NOT NULL,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seed_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_key text NOT NULL,
  environment text NOT NULL,
  tenant_id uuid,
  status text NOT NULL DEFAULT 'completed',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS repository_test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_suite text NOT NULL,
  status text NOT NULL,
  tenant_id uuid,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS tenant_isolation_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  detected_table text NOT NULL,
  detected_query text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'critical',
  status text NOT NULL DEFAULT 'open',
  detected_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_seed_runs_environment_key
ON seed_runs (environment, seed_key, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_repository_test_runs_suite
ON repository_test_runs (test_suite, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_tenant_isolation_violations_status
ON tenant_isolation_violations (status, detected_at DESC);
