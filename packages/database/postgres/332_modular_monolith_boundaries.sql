-- Sprint 332: Modular Monolith Boundaries
CREATE TABLE IF NOT EXISTS phase20_332_modular_monolith_boundaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase20_332_modular_monolith_boundaries_tenant_status ON phase20_332_modular_monolith_boundaries (tenant_id, status);
