-- Sprint 129 PostgreSQL migration: privacy rights and DSAR operations.

CREATE TABLE IF NOT EXISTS privacy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  request_number text NOT NULL,
  request_type text NOT NULL DEFAULT 'access',
  status text NOT NULL DEFAULT 'submitted',
  subject_name text NOT NULL DEFAULT '',
  subject_email text NOT NULL,
  requester_email text NOT NULL DEFAULT '',
  jurisdiction text NOT NULL DEFAULT '',
  submitted_at timestamptz NOT NULL,
  due_at timestamptz,
  fulfilled_at timestamptz,
  rejection_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  method text NOT NULL DEFAULT 'email_challenge',
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL,
  verified_at timestamptz,
  failed_at timestamptz,
  evidence_ref text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_search_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  source_system text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  query text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  records_found integer NOT NULL DEFAULT 0,
  output_ref text NOT NULL DEFAULT '',
  error_message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_response_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  prepared_by text NOT NULL DEFAULT '',
  prepared_at timestamptz,
  package_url text NOT NULL DEFAULT '',
  redactions jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
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

CREATE TABLE IF NOT EXISTS privacy_fulfillments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  channel text NOT NULL DEFAULT 'email',
  recipient_email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'queued',
  queued_at timestamptz NOT NULL,
  sent_at timestamptz,
  failed_at timestamptz,
  failure_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_privacy_requests_tenant_status ON privacy_requests (tenant_id, status, request_type, due_at);
CREATE INDEX IF NOT EXISTS idx_privacy_verifications_request_status ON privacy_identity_verifications (request_id, status);
CREATE INDEX IF NOT EXISTS idx_privacy_search_tasks_request_status ON privacy_search_tasks (request_id, status);
CREATE INDEX IF NOT EXISTS idx_privacy_packages_request_status ON privacy_response_packages (request_id, status);
CREATE INDEX IF NOT EXISTS idx_privacy_approvals_request_status ON privacy_approvals (request_id, status);
CREATE INDEX IF NOT EXISTS idx_privacy_fulfillments_request_status ON privacy_fulfillments (request_id, status);
