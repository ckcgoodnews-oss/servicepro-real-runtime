-- Sprint 288: Regional Configuration Management
CREATE TABLE IF NOT EXISTS phase17_288_regional_configuration_management (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase17_288_regional_configuration_management_tenant_status ON phase17_288_regional_configuration_management (tenant_id, status);
