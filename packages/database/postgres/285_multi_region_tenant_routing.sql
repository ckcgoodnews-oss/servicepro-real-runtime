-- Sprint 285: Multi Region Tenant Routing
CREATE TABLE IF NOT EXISTS phase17_285_multi_region_tenant_routing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase17_285_multi_region_tenant_routing_tenant_status ON phase17_285_multi_region_tenant_routing (tenant_id, status);
