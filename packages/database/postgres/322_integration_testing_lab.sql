-- Sprint 322: Integration Testing Lab
CREATE TABLE IF NOT EXISTS phase19_322_integration_testing_lab (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase19_322_integration_testing_lab_tenant_status ON phase19_322_integration_testing_lab (tenant_id, status);
