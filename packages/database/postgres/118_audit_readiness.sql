-- Sprint 118 PostgreSQL migration: audit readiness runtime.

CREATE TABLE IF NOT EXISTS audit_engagements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'planned',
  audit_firm text NOT NULL DEFAULT '',
  auditor_lead text NOT NULL DEFAULT '',
  internal_owner text NOT NULL DEFAULT '',
  framework_id text NOT NULL DEFAULT '',
  period_start date,
  period_end date,
  start_at timestamptz NOT NULL,
  due_at timestamptz,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auditor_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL,
  control_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  owner text NOT NULL DEFAULT '',
  requested_by text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL,
  due_at timestamptz,
  submitted_at timestamptz,
  accepted_at timestamptz,
  rejection_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_evidence_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  prepared_by text NOT NULL DEFAULT '',
  prepared_at timestamptz,
  submitted_at timestamptz,
  artifacts jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_walkthroughs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL,
  control_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  scheduled_at timestamptz NOT NULL,
  completed_at timestamptz,
  attendees jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  recording_url text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_sample_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL,
  control_id text NOT NULL,
  population_name text NOT NULL DEFAULT '',
  sample_size integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'requested',
  requested_at timestamptz NOT NULL,
  collected_at timestamptz,
  submitted_at timestamptz,
  sample_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL,
  control_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  owner text NOT NULL DEFAULT '',
  management_response text NOT NULL DEFAULT '',
  due_at timestamptz,
  closed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_engagements_status_due ON audit_engagements (status, due_at);
CREATE INDEX IF NOT EXISTS idx_auditor_requests_engagement_status ON auditor_requests (engagement_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_audit_packages_request_status ON audit_evidence_packages (request_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_walkthroughs_engagement_status ON audit_walkthroughs (engagement_id, status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_audit_samples_engagement_status ON audit_sample_requests (engagement_id, status, requested_at);
CREATE INDEX IF NOT EXISTS idx_audit_issues_engagement_status ON audit_issues (engagement_id, status, severity, due_at);
