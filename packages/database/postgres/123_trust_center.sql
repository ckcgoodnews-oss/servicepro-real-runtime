-- Sprint 123 PostgreSQL migration: customer trust center operations.

CREATE TABLE IF NOT EXISTS trust_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  company_name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  overview text NOT NULL DEFAULT '',
  security_contact_email text NOT NULL DEFAULT '',
  privacy_contact_email text NOT NULL DEFAULT '',
  certifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  security_highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  published_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trust_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  document_type text NOT NULL DEFAULT 'other',
  status text NOT NULL DEFAULT 'draft',
  visibility text NOT NULL DEFAULT 'gated',
  file_url text NOT NULL DEFAULT '',
  version text NOT NULL DEFAULT '',
  valid_from timestamptz,
  valid_until timestamptz,
  published_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trust_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  document_id uuid NOT NULL,
  requester_name text NOT NULL DEFAULT '',
  requester_email text NOT NULL,
  company_name text NOT NULL DEFAULT '',
  business_reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'submitted',
  nda_status text NOT NULL DEFAULT 'not_required',
  requested_at timestamptz NOT NULL,
  decided_by text NOT NULL DEFAULT '',
  decided_at timestamptz,
  expires_at timestamptz,
  rejection_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trust_document_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  document_id uuid NOT NULL,
  access_request_id uuid NOT NULL,
  recipient_email text NOT NULL DEFAULT '',
  token text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL,
  expires_at timestamptz,
  last_viewed_at timestamptz,
  revoked_by text NOT NULL DEFAULT '',
  revoked_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trust_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  document_id uuid,
  access_request_id uuid,
  share_id uuid,
  event_type text NOT NULL,
  actor_email text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  occurred_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trust_profiles_tenant_status ON trust_profiles (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_trust_documents_tenant_status_type ON trust_documents (tenant_id, status, document_type, visibility);
CREATE INDEX IF NOT EXISTS idx_trust_requests_tenant_status ON trust_access_requests (tenant_id, status, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_trust_requests_document_status ON trust_access_requests (document_id, status);
CREATE INDEX IF NOT EXISTS idx_trust_shares_tenant_status ON trust_document_shares (tenant_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_trust_audit_tenant_time ON trust_audit_events (tenant_id, occurred_at DESC);
