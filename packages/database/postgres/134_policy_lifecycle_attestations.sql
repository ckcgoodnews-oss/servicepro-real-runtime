-- Sprint 134 PostgreSQL migration: policy lifecycle and attestations.

CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  policy_type text NOT NULL DEFAULT 'other',
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  business_unit text NOT NULL DEFAULT '',
  current_version_id uuid,
  review_frequency_days integer NOT NULL DEFAULT 365,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS policy_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  version text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  summary text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  document_url text NOT NULL DEFAULT '',
  author text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL,
  reviewed_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS policy_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_version_id uuid NOT NULL,
  policy_id uuid,
  tenant_id text NOT NULL DEFAULT '',
  approver_id text NOT NULL,
  approver_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL,
  responded_at timestamptz,
  comments text NOT NULL DEFAULT '',
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS policy_attestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid NOT NULL,
  policy_version_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  subject_id text NOT NULL,
  subject_name text NOT NULL DEFAULT '',
  subject_email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'assigned',
  assigned_at timestamptz NOT NULL,
  due_at timestamptz,
  acknowledged_at timestamptz,
  waiver_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS policy_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid NOT NULL,
  policy_version_id uuid,
  tenant_id text NOT NULL DEFAULT '',
  requester_id text NOT NULL,
  requester_name text NOT NULL DEFAULT '',
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'requested',
  compensating_controls text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL,
  decided_by text NOT NULL DEFAULT '',
  decided_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS policy_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'scheduled',
  reviewer_id text NOT NULL DEFAULT '',
  reviewer_name text NOT NULL DEFAULT '',
  scheduled_at timestamptz NOT NULL,
  completed_at timestamptz,
  notes text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_policies_tenant_status_type ON policies (tenant_id, status, policy_type, next_review_at);
CREATE INDEX IF NOT EXISTS idx_policy_versions_policy_status ON policy_versions (policy_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_policy_approvals_version_status ON policy_approvals (policy_version_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_policy_attestations_policy_status ON policy_attestations (policy_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_policy_attestations_subject ON policy_attestations (tenant_id, subject_id, status);
CREATE INDEX IF NOT EXISTS idx_policy_exceptions_policy_status ON policy_exceptions (policy_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_policy_reviews_policy_status ON policy_reviews (policy_id, status, scheduled_at DESC);
