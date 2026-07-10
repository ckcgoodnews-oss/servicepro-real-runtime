-- Sprint 126 PostgreSQL migration: customer data residency and localization controls.

CREATE TABLE IF NOT EXISTS data_residency_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  description text NOT NULL DEFAULT '',
  allowed_regions jsonb NOT NULL DEFAULT '[]'::jsonb,
  restricted_regions jsonb NOT NULL DEFAULT '[]'::jsonb,
  data_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  owner text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_region_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_id text NOT NULL,
  customer_name text NOT NULL DEFAULT '',
  policy_id uuid,
  region_code text NOT NULL,
  region_name text NOT NULL DEFAULT '',
  region_type text NOT NULL DEFAULT 'cloud_region',
  status text NOT NULL DEFAULT 'active',
  assigned_by text NOT NULL DEFAULT '',
  assigned_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_transfer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_id text NOT NULL,
  request_number text NOT NULL,
  source_region text NOT NULL,
  target_region text NOT NULL,
  data_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'requested',
  business_reason text NOT NULL DEFAULT '',
  requested_by text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL,
  reviewed_by text NOT NULL DEFAULT '',
  reviewed_at timestamptz,
  completed_at timestamptz,
  rejection_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_localization_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  region_code text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  owner text NOT NULL DEFAULT '',
  due_at timestamptz,
  satisfied_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_residency_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_id text NOT NULL,
  policy_id uuid,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  detected_region text NOT NULL DEFAULT '',
  expected_regions jsonb NOT NULL DEFAULT '[]'::jsonb,
  detected_at timestamptz NOT NULL,
  owner text NOT NULL DEFAULT '',
  remediated_at timestamptz,
  closed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_transfer_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_review_id uuid NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_data_residency_policies_tenant_status ON data_residency_policies (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_data_assignments_customer_status ON data_region_assignments (tenant_id, customer_id, status);
CREATE INDEX IF NOT EXISTS idx_data_transfers_customer_status ON data_transfer_reviews (tenant_id, customer_id, status, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_requirements_region_status ON data_localization_requirements (tenant_id, region_code, status);
CREATE INDEX IF NOT EXISTS idx_data_violations_customer_status ON data_residency_violations (tenant_id, customer_id, status, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_approvals_review_status ON data_transfer_approvals (transfer_review_id, status);
