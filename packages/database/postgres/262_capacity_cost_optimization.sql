-- Sprint 262: Capacity Cost Optimization
CREATE TABLE IF NOT EXISTS phase15_262_capacity_cost_optimization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase15_262_capacity_cost_optimization_tenant_status ON phase15_262_capacity_cost_optimization (tenant_id, status);
