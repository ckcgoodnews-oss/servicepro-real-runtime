-- Sprint 195: Distributed Tracing
CREATE TABLE IF NOT EXISTS phase11_195_distributed_tracing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase11_195_distributed_tracing_tenant_status ON phase11_195_distributed_tracing (tenant_id, status);
