-- Sprint 319: Developer Test Harness
CREATE TABLE IF NOT EXISTS phase19_319_developer_test_harness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase19_319_developer_test_harness_tenant_status ON phase19_319_developer_test_harness (tenant_id, status);
