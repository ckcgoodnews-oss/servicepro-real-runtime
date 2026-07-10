-- Sprint 95 PostgreSQL migration: predictive maintenance models and prediction snapshots.

CREATE TABLE IF NOT EXISTS predictive_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  equipment_type text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  weights jsonb NOT NULL DEFAULT '{}'::jsonb,
  risk_thresholds jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS asset_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  model_id uuid,
  asset_id uuid NOT NULL,
  customer_id uuid,
  equipment_type text NOT NULL DEFAULT '',
  risk_score numeric(8,2) NOT NULL DEFAULT 0,
  risk_band text NOT NULL DEFAULT 'low',
  failure_probability_percent numeric(8,2) NOT NULL DEFAULT 0,
  drivers jsonb NOT NULL DEFAULT '[]'::jsonb,
  factors jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommended_actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'open',
  generated_at timestamptz NOT NULL,
  converted_job_id uuid,
  dismissed_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_predictive_models_tenant_status
ON predictive_models (tenant_id, status, equipment_type);

CREATE INDEX IF NOT EXISTS idx_asset_predictions_tenant_asset
ON asset_predictions (tenant_id, asset_id, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_asset_predictions_tenant_customer
ON asset_predictions (tenant_id, customer_id, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_asset_predictions_tenant_risk
ON asset_predictions (tenant_id, risk_band, status, generated_at DESC);
