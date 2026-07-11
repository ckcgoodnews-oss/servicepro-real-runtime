-- Sprint 264: Version 2 0 1 Release Readiness
CREATE TABLE IF NOT EXISTS phase15_264_version_2_0_1_release_readiness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase15_264_version_2_0_1_release_readiness_tenant_status ON phase15_264_version_2_0_1_release_readiness (tenant_id, status);
