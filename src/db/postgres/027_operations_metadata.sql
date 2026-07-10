-- Sprint 27 PostgreSQL migration: operational metadata.

CREATE TABLE IF NOT EXISTS deployment_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  git_sha text,
  deployed_by text,
  deployed_at timestamptz NOT NULL DEFAULT now(),
  environment text NOT NULL DEFAULT 'production',
  notes text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS backup_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  storage_key text,
  started_at timestamptz,
  finished_at timestamptz,
  error_message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS health_check_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  status text NOT NULL,
  response_ms integer,
  checked_at timestamptz NOT NULL DEFAULT now(),
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_backup_runs_status_created
ON backup_runs (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_health_check_events_service_time
ON health_check_events (service_name, checked_at DESC);
