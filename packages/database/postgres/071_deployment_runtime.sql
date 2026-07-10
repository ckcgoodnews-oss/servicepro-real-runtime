-- Sprint 71 PostgreSQL migration: deployment metadata.

CREATE TABLE IF NOT EXISTS deployment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'system',
  app_version text NOT NULL DEFAULT '',
  environment text NOT NULL DEFAULT '',
  event_type text NOT NULL DEFAULT 'deployment',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deployment_events_time
ON deployment_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_deployment_events_env_version
ON deployment_events (environment, app_version, created_at DESC);
