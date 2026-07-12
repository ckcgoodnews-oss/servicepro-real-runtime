-- Sprint 460: Version 4 0 1 Maintenance Release
CREATE TABLE IF NOT EXISTS phase28_460_version_4_0_1_maintenance_release (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  gate_required boolean NOT NULL DEFAULT true,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase28_460_version_4_0_1_maintenance_release_tenant_status ON phase28_460_version_4_0_1_maintenance_release (tenant_id, status);
