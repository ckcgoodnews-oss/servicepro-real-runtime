-- Sprint 296: Industry Solution Framework
CREATE TABLE IF NOT EXISTS phase18_296_industry_solution_framework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase18_296_industry_solution_framework_tenant_status ON phase18_296_industry_solution_framework (tenant_id, status);
