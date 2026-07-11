-- Sprint 182: Forecasting Engine
CREATE TABLE IF NOT EXISTS phase10_182_forecasting_engine (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase10_182_forecasting_engine_tenant_status ON phase10_182_forecasting_engine (tenant_id, status);
