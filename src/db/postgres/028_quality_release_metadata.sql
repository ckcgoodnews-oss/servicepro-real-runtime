-- Sprint 28 PostgreSQL migration: QA, test runs, and release verification metadata.

CREATE TABLE IF NOT EXISTS test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_version text NOT NULL,
  test_suite text NOT NULL,
  status text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS release_verification_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_version text NOT NULL,
  environment text NOT NULL DEFAULT 'staging',
  verified_by text,
  status text NOT NULL DEFAULT 'pending',
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz
);

CREATE TABLE IF NOT EXISTS migration_validation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_file text NOT NULL,
  checksum_sha256 text,
  status text NOT NULL,
  validation_message text NOT NULL DEFAULT '',
  validated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accessibility_audit_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  page_url text NOT NULL,
  status text NOT NULL,
  issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  audited_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_runs_release_suite
ON test_runs (release_version, test_suite, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_release_verification_reports_release
ON release_verification_reports (release_version, environment, created_at DESC);
