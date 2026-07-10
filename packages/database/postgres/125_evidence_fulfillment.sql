-- Sprint 125 PostgreSQL migration: customer evidence fulfillment.

CREATE TABLE IF NOT EXISTS evidence_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  customer_name text NOT NULL DEFAULT '',
  valid_until timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence_bundle_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  item_type text NOT NULL DEFAULT 'document',
  source_system text NOT NULL DEFAULT '',
  source_id text NOT NULL DEFAULT '',
  file_url text NOT NULL DEFAULT '',
  version text NOT NULL DEFAULT '',
  sensitivity text NOT NULL DEFAULT 'confidential',
  included boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence_fulfillment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  request_number text NOT NULL,
  bundle_id uuid,
  customer_name text NOT NULL,
  requester_name text NOT NULL DEFAULT '',
  requester_email text NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  business_reason text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL,
  due_at timestamptz,
  delivered_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence_delivery_approvals (
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

CREATE TABLE IF NOT EXISTS evidence_delivery_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  bundle_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  recipient_email text NOT NULL DEFAULT '',
  token text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL,
  expires_at timestamptz,
  opened_at timestamptz,
  revoked_by text NOT NULL DEFAULT '',
  revoked_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence_access_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  link_id uuid,
  bundle_id uuid,
  bundle_item_id uuid,
  tenant_id text NOT NULL DEFAULT '',
  event_type text NOT NULL,
  actor_email text NOT NULL DEFAULT '',
  occurred_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_bundles_tenant_status ON evidence_bundles (tenant_id, status, name);
CREATE INDEX IF NOT EXISTS idx_evidence_items_bundle ON evidence_bundle_items (bundle_id, included);
CREATE INDEX IF NOT EXISTS idx_evidence_requests_tenant_status ON evidence_fulfillment_requests (tenant_id, status, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_approvals_request_status ON evidence_delivery_approvals (request_id, status);
CREATE INDEX IF NOT EXISTS idx_evidence_links_request_status ON evidence_delivery_links (request_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_evidence_events_request_time ON evidence_access_events (request_id, occurred_at DESC);
