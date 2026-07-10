-- Sprint 91 PostgreSQL migration: warranty policies, warranty claims, and callbacks.

CREATE TABLE IF NOT EXISTS warranty_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  coverage_type text NOT NULL DEFAULT 'labor_and_parts',
  duration_days integer NOT NULL DEFAULT 30,
  labor_covered_percent numeric(8,2) NOT NULL DEFAULT 100,
  parts_covered_percent numeric(8,2) NOT NULL DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS warranty_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_id uuid NOT NULL,
  original_job_id uuid NOT NULL,
  callback_job_id uuid,
  policy_id uuid,
  claim_date date NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  problem_summary text NOT NULL DEFAULT '',
  diagnosis text NOT NULL DEFAULT '',
  covered boolean NOT NULL DEFAULT false,
  denied_reason text NOT NULL DEFAULT '',
  approved_by text NOT NULL DEFAULT '',
  approved_at timestamptz,
  completed_at timestamptz,
  estimated_labor_credit numeric(12,2) NOT NULL DEFAULT 0,
  estimated_parts_credit numeric(12,2) NOT NULL DEFAULT 0,
  actual_labor_credit numeric(12,2) NOT NULL DEFAULT 0,
  actual_parts_credit numeric(12,2) NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS callbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_id uuid NOT NULL,
  original_job_id uuid NOT NULL,
  callback_job_id uuid,
  warranty_claim_id uuid,
  status text NOT NULL DEFAULT 'open',
  reason text NOT NULL,
  reported_at timestamptz NOT NULL,
  scheduled_at timestamptz,
  resolved_at timestamptz,
  billable boolean NOT NULL DEFAULT false,
  root_cause text NOT NULL DEFAULT '',
  resolution_notes text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_warranty_policies_tenant_active
ON warranty_policies (tenant_id, active, code);

CREATE INDEX IF NOT EXISTS idx_warranty_claims_tenant_customer
ON warranty_claims (tenant_id, customer_id, claim_date DESC);

CREATE INDEX IF NOT EXISTS idx_warranty_claims_tenant_original_job
ON warranty_claims (tenant_id, original_job_id, claim_date DESC);

CREATE INDEX IF NOT EXISTS idx_callbacks_tenant_original_job
ON callbacks (tenant_id, original_job_id, reported_at DESC);

CREATE INDEX IF NOT EXISTS idx_callbacks_tenant_status
ON callbacks (tenant_id, status, reported_at DESC);
