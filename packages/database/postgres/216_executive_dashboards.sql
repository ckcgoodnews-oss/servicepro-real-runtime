-- Sprint 216: Executive Dashboards
CREATE TABLE IF NOT EXISTS phase13_216_executive_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase13_216_executive_dashboards_tenant_status ON phase13_216_executive_dashboards (tenant_id, status);
