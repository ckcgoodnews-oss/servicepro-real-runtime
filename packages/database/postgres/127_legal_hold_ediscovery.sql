-- Sprint 127 PostgreSQL migration: legal hold and eDiscovery runtime.

CREATE TABLE IF NOT EXISTS legal_matters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  matter_number text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  matter_type text NOT NULL DEFAULT 'other',
  status text NOT NULL DEFAULT 'open',
  owner text NOT NULL DEFAULT '',
  outside_counsel text NOT NULL DEFAULT '',
  opened_at timestamptz NOT NULL,
  closed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ediscovery_legal_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  issued_by text NOT NULL DEFAULT '',
  issued_at timestamptz,
  released_by text NOT NULL DEFAULT '',
  released_at timestamptz,
  instructions text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS legal_hold_custodians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hold_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  email text NOT NULL,
  status text NOT NULL DEFAULT 'notified',
  notified_at timestamptz NOT NULL,
  acknowledged_at timestamptz,
  released_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS legal_preservation_scopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hold_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  scope_type text NOT NULL,
  source_system text NOT NULL DEFAULT '',
  query text NOT NULL DEFAULT '',
  date_from timestamptz,
  date_to timestamptz,
  preserved boolean NOT NULL DEFAULT false,
  preserved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS legal_collection_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hold_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'queued',
  requested_by text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  item_count integer NOT NULL DEFAULT 0,
  output_location text NOT NULL DEFAULT '',
  error_message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS legal_export_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL,
  hold_id uuid,
  tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'queued',
  format text NOT NULL DEFAULT 'zip',
  requested_by text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  output_url text NOT NULL DEFAULT '',
  item_count integer NOT NULL DEFAULT 0,
  error_message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_legal_matters_tenant_status ON legal_matters (tenant_id, status, matter_type, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_legal_holds_matter_status ON ediscovery_legal_holds (matter_id, status);
CREATE INDEX IF NOT EXISTS idx_legal_custodians_hold_status ON legal_hold_custodians (hold_id, status);
CREATE INDEX IF NOT EXISTS idx_legal_scopes_hold_type ON legal_preservation_scopes (hold_id, scope_type, preserved);
CREATE INDEX IF NOT EXISTS idx_legal_collections_hold_status ON legal_collection_jobs (hold_id, status, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_legal_exports_matter_status ON legal_export_jobs (matter_id, status, requested_at DESC);
