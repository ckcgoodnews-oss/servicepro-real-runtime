-- Sprint 310: Industry Solutions Release
CREATE TABLE IF NOT EXISTS phase18_310_industry_solutions_release (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase18_310_industry_solutions_release_tenant_status ON phase18_310_industry_solutions_release (tenant_id, status);
