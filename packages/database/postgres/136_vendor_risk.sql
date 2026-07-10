-- Sprint 136 PostgreSQL migration: third-party vendor risk management.

CREATE TABLE IF NOT EXISTS vendor_risk_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'prospect',
  criticality text NOT NULL DEFAULT 'medium',
  owner text NOT NULL DEFAULT '',
  business_unit text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  data_access jsonb NOT NULL DEFAULT '[]'::jsonb,
  regions jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_risk_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
  service_type text NOT NULL DEFAULT 'other',
  processes_personal_data boolean NOT NULL DEFAULT false,
  data_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  integration_type text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  assessor text NOT NULL DEFAULT '',
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  inherent_risk text NOT NULL DEFAULT 'medium',
  residual_risk text NOT NULL DEFAULT 'medium',
  score numeric(6,2),
  summary text NOT NULL DEFAULT '',
  security_notes text NOT NULL DEFAULT '',
  privacy_notes text NOT NULL DEFAULT '',
  business_continuity_notes text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_risk_attestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  assessment_id uuid,
  tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'requested',
  requested_at timestamptz NOT NULL,
  received_at timestamptz,
  document_type text NOT NULL DEFAULT 'security_questionnaire',
  document_url text NOT NULL DEFAULT '',
  reviewed_by text NOT NULL DEFAULT '',
  reviewed_at timestamptz,
  rejection_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_risk_remediations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  assessment_id uuid,
  tenant_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  owner text NOT NULL DEFAULT '',
  due_at timestamptz,
  completed_at timestamptz,
  waiver_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_risk_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_vendor_risk_vendors_tenant_status ON vendor_risk_vendors (tenant_id, status, criticality, next_review_at);
CREATE INDEX IF NOT EXISTS idx_vendor_risk_services_vendor_status ON vendor_risk_services (vendor_id, status, processes_personal_data);
CREATE INDEX IF NOT EXISTS idx_vendor_risk_assessments_vendor_status ON vendor_risk_assessments (vendor_id, status, residual_risk);
CREATE INDEX IF NOT EXISTS idx_vendor_risk_attestations_vendor_status ON vendor_risk_attestations (vendor_id, status, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_risk_remediations_vendor_status ON vendor_risk_remediations (vendor_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_vendor_risk_reviews_vendor_status ON vendor_risk_reviews (vendor_id, status, scheduled_at DESC);
