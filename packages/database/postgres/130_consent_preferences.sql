-- Sprint 130 PostgreSQL migration: consent and preference management.

CREATE TABLE IF NOT EXISTS consent_purposes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  purpose_type text NOT NULL DEFAULT 'other',
  status text NOT NULL DEFAULT 'active',
  legal_basis text NOT NULL DEFAULT 'consent',
  default_retention_days integer NOT NULL DEFAULT 730,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consent_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  external_subject_id text NOT NULL DEFAULT '',
  email text NOT NULL,
  name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  locale text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  created_source text NOT NULL DEFAULT 'api',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS preference_consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  subject_id uuid NOT NULL,
  purpose_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'granted',
  source text NOT NULL DEFAULT 'api',
  channel text NOT NULL DEFAULT 'email',
  proof_text text NOT NULL DEFAULT '',
  proof_url text NOT NULL DEFAULT '',
  granted_at timestamptz NOT NULL,
  withdrawn_at timestamptz,
  expires_at timestamptz,
  withdrawal_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consent_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  subject_id uuid NOT NULL,
  preference_key text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  value jsonb NOT NULL DEFAULT 'true'::jsonb,
  updated_by text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consent_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  subject_id uuid,
  purpose_id uuid,
  reason text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'api',
  withdrawn_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consent_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  subject_id uuid,
  purpose_id uuid,
  consent_id uuid,
  event_type text NOT NULL,
  actor text NOT NULL DEFAULT '',
  occurred_at timestamptz NOT NULL,
  message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_purposes_tenant_status ON consent_purposes (tenant_id, status, purpose_type);
CREATE INDEX IF NOT EXISTS idx_consent_subjects_tenant_email ON consent_subjects (tenant_id, email, status);
CREATE INDEX IF NOT EXISTS idx_preference_consent_records_subject_status ON preference_consent_records (subject_id, status, purpose_id);
CREATE INDEX IF NOT EXISTS idx_consent_preferences_subject_key ON consent_preferences (subject_id, preference_key, status);
CREATE INDEX IF NOT EXISTS idx_consent_withdrawals_consent ON consent_withdrawals (consent_id, withdrawn_at DESC);
CREATE INDEX IF NOT EXISTS idx_consent_audit_tenant_time ON consent_audit_events (tenant_id, occurred_at DESC);
