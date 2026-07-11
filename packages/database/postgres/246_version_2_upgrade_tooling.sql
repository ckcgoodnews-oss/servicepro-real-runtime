-- Sprint 246: Version 2 Upgrade Tooling
CREATE TABLE IF NOT EXISTS phase14_246_version_2_upgrade_tooling (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase14_246_version_2_upgrade_tooling_tenant_status ON phase14_246_version_2_upgrade_tooling (tenant_id, status);
