-- Sprint 186: Platform Health Dashboard
CREATE TABLE IF NOT EXISTS phase11_186_platform_health_dashboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase11_186_platform_health_dashboard_tenant_status ON phase11_186_platform_health_dashboard (tenant_id, status);
