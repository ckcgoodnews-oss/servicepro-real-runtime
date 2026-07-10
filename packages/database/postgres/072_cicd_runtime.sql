-- Sprint 72 PostgreSQL migration: CI/CD release metadata.

CREATE TABLE IF NOT EXISTS release_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'system',
  release_version text NOT NULL DEFAULT '',
  git_sha text NOT NULL DEFAULT '',
  branch_name text NOT NULL DEFAULT '',
  event_type text NOT NULL DEFAULT 'release',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_release_events_version
ON release_events (release_version, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_release_events_branch_time
ON release_events (branch_name, created_at DESC);
