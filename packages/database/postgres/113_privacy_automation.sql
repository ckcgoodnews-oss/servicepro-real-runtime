-- Sprint 113 PostgreSQL migration: privacy automation runtime.

CREATE TABLE IF NOT EXISTS privacy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  request_number text NOT NULL UNIQUE,
  request_type text NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  subject_name text NOT NULL DEFAULT '',
  subject_email text NOT NULL,
  requester_email text NOT NULL DEFAULT '',
  identity_verified_at timestamptz,
  submitted_at timestamptz NOT NULL,
  due_at timestamptz NOT NULL,
  completed_at timestamptz,
  rejection_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  subject_email text NOT NULL,
  purpose text NOT NULL,
  status text NOT NULL DEFAULT 'granted',
  source text NOT NULL DEFAULT 'manual',
  granted_at timestamptz,
  withdrawn_at timestamptz,
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_export_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'queued',
  requested_by text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  output_url text NOT NULL DEFAULT '',
  error_message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS redaction_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  target_type text NOT NULL,
  target_id text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  redacted_by text NOT NULL DEFAULT '',
  redacted_at timestamptz,
  failure_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS erasure_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  approver_id text NOT NULL,
  approver_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL,
  responded_at timestamptz,
  comments text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  event_type text NOT NULL,
  actor_id text NOT NULL DEFAULT '',
  actor_name text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  occurred_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_privacy_requests_tenant_status ON privacy_requests (tenant_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_consent_records_subject_status ON consent_records (tenant_id, subject_email, status);
CREATE INDEX IF NOT EXISTS idx_privacy_export_jobs_request_status ON privacy_export_jobs (request_id, status);
CREATE INDEX IF NOT EXISTS idx_redaction_tasks_request_status ON redaction_tasks (request_id, status);
CREATE INDEX IF NOT EXISTS idx_erasure_approvals_request_status ON erasure_approvals (request_id, status);
CREATE INDEX IF NOT EXISTS idx_privacy_audit_request ON privacy_audit_events (request_id, occurred_at);
