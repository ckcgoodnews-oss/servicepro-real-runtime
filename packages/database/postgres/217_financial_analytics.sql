-- Sprint 217: Financial Analytics
CREATE TABLE IF NOT EXISTS phase13_217_financial_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase13_217_financial_analytics_tenant_status ON phase13_217_financial_analytics (tenant_id, status);
