-- Sprint 151 PostgreSQL migration: privacy operations and data subject rights.

CREATE TABLE IF NOT EXISTS privacy_dsars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  request_number text NOT NULL,
  subject_id text NOT NULL,
  subject_email text NOT NULL DEFAULT '',
  request_type text NOT NULL DEFAULT 'access',
  status text NOT NULL DEFAULT 'received',
  jurisdiction text NOT NULL DEFAULT 'US',
  received_at timestamptz NOT NULL,
  due_at timestamptz,
  verified_at timestamptz,
  fulfilled_at timestamptz,
  denied_at timestamptz,
  denial_reason text NOT NULL DEFAULT '',
  assigned_to text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  subject_id text NOT NULL,
  purpose text NOT NULL,
  status text NOT NULL DEFAULT 'granted',
  source text NOT NULL DEFAULT '',
  granted_at timestamptz,
  withdrawn_at timestamptz,
  expires_at timestamptz,
  policy_version text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  data_category text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  retention_days integer NOT NULL DEFAULT 365,
  legal_basis text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  activated_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_deletion_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  subject_id text NOT NULL DEFAULT '',
  policy_id uuid,
  request_id uuid,
  status text NOT NULL DEFAULT 'queued',
  scope text NOT NULL DEFAULT 'subject',
  scheduled_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  records_deleted integer NOT NULL DEFAULT 0,
  failure_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_processing_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  data_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  subject_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  processor text NOT NULL DEFAULT '',
  legal_basis text NOT NULL DEFAULT '',
  risk_level text NOT NULL DEFAULT 'medium',
  owner text NOT NULL DEFAULT '',
  reviewed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_dpias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  processing_activity_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  risk_level text NOT NULL DEFAULT 'medium',
  assessor text NOT NULL DEFAULT '',
  assessment_summary text NOT NULL DEFAULT '',
  mitigations jsonb NOT NULL DEFAULT '[]'::jsonb,
  reviewed_by text NOT NULL DEFAULT '',
  reviewed_at timestamptz,
  approved_at timestamptz,
  rejection_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_breach_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'suspected',
  risk_level text NOT NULL DEFAULT 'medium',
  discovered_at timestamptz NOT NULL,
  confirmed_at timestamptz,
  authority_notified_at timestamptz,
  subjects_notified_at timestamptz,
  closed_at timestamptz,
  affected_subject_count integer NOT NULL DEFAULT 0,
  regulator_reference text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_privacy_dsars_tenant_status ON privacy_dsars (tenant_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_privacy_dsars_subject ON privacy_dsars (subject_id, request_type, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_privacy_consents_subject ON privacy_consents (subject_id, purpose, status);
CREATE INDEX IF NOT EXISTS idx_privacy_retention_tenant_status ON privacy_retention_policies (tenant_id, status, data_category);
CREATE INDEX IF NOT EXISTS idx_privacy_deletion_jobs_tenant_status ON privacy_deletion_jobs (tenant_id, status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_privacy_processing_tenant_status ON privacy_processing_activities (tenant_id, status, risk_level);
CREATE INDEX IF NOT EXISTS idx_privacy_dpias_activity_status ON privacy_dpias (processing_activity_id, status, risk_level);
CREATE INDEX IF NOT EXISTS idx_privacy_breaches_tenant_status ON privacy_breach_notifications (tenant_id, status, risk_level, discovered_at DESC);
