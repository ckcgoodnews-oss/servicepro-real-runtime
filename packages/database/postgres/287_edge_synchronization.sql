-- Sprint 287: Edge Synchronization
CREATE TABLE IF NOT EXISTS phase17_287_edge_synchronization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase17_287_edge_synchronization_tenant_status ON phase17_287_edge_synchronization (tenant_id, status);
