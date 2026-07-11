-- Sprint 193: Performance Monitoring
CREATE TABLE IF NOT EXISTS phase11_193_performance_monitoring (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase11_193_performance_monitoring_tenant_status ON phase11_193_performance_monitoring (tenant_id, status);
