-- Sprint 222: Dashboard Designer
CREATE TABLE IF NOT EXISTS phase13_222_dashboard_designer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase13_222_dashboard_designer_tenant_status ON phase13_222_dashboard_designer (tenant_id, status);
