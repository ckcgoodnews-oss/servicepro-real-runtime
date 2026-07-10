-- Sprint 112 PostgreSQL migration: document retention and compliance controls.

CREATE TABLE IF NOT EXISTS retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  document_type text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  retention_days integer NOT NULL DEFAULT 2555,
  review_before_delete_days integer NOT NULL DEFAULT 30,
  allow_auto_delete boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id text NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  document_type text NOT NULL DEFAULT 'document',
  classification_level text NOT NULL DEFAULT 'internal',
  policy_id uuid,
  classified_by text NOT NULL DEFAULT '',
  classified_at timestamptz NOT NULL,
  source_created_at timestamptz NOT NULL,
  retain_until date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS legal_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id text NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  reason text NOT NULL,
  placed_by text NOT NULL DEFAULT '',
  placed_at timestamptz NOT NULL,
  released_by text NOT NULL DEFAULT '',
  released_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS retention_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id text NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  policy_id uuid,
  status text NOT NULL DEFAULT 'pending',
  reason text NOT NULL DEFAULT '',
  reviewed_by text NOT NULL DEFAULT '',
  reviewed_at timestamptz,
  due_at date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_export_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  format text NOT NULL DEFAULT 'json',
  requested_by text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  filter jsonb NOT NULL DEFAULT '{}'::jsonb,
  output_url text NOT NULL DEFAULT '',
  error_message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retention_policies_type_status ON retention_policies (document_type, status);
CREATE INDEX IF NOT EXISTS idx_document_classifications_tenant_type ON document_classifications (tenant_id, document_type, classification_level);
CREATE INDEX IF NOT EXISTS idx_legal_holds_document_status ON legal_holds (document_id, status);
CREATE INDEX IF NOT EXISTS idx_retention_reviews_tenant_status_due ON retention_reviews (tenant_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_compliance_export_jobs_tenant_status ON compliance_export_jobs (tenant_id, status, requested_at DESC);
