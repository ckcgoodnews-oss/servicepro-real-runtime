-- Sprint 261: Customer Health Churn Risk
CREATE TABLE IF NOT EXISTS phase15_261_customer_health_churn_risk (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase15_261_customer_health_churn_risk_tenant_status ON phase15_261_customer_health_churn_risk (tenant_id, status);
