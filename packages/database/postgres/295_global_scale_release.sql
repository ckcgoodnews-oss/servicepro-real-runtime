-- Sprint 295: Global Scale Release
CREATE TABLE IF NOT EXISTS phase17_295_global_scale_release (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase17_295_global_scale_release_tenant_status ON phase17_295_global_scale_release (tenant_id, status);
