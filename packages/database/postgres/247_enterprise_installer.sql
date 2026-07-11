-- Sprint 247: Enterprise Installer
CREATE TABLE IF NOT EXISTS phase14_247_enterprise_installer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase14_247_enterprise_installer_tenant_status ON phase14_247_enterprise_installer (tenant_id, status);
