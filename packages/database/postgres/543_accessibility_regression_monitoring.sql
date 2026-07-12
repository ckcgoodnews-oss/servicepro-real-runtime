-- Sprint 543: Accessibility Regression Monitoring
CREATE TABLE IF NOT EXISTS phase34_accessibility_regression_monitoring_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase34_accessibility_regression_monitoring_tenant_status ON phase34_accessibility_regression_monitoring_records (tenant_id,status);
