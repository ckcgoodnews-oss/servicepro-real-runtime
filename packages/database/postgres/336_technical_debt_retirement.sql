-- Sprint 336: Technical Debt Retirement
CREATE TABLE IF NOT EXISTS phase20_336_technical_debt_retirement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase20_336_technical_debt_retirement_tenant_status ON phase20_336_technical_debt_retirement (tenant_id, status);
