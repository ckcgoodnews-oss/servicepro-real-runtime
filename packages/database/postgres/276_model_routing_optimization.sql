-- Sprint 276: Model Routing Optimization
CREATE TABLE IF NOT EXISTS phase16_276_model_routing_optimization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase16_276_model_routing_optimization_tenant_status ON phase16_276_model_routing_optimization (tenant_id, status);
