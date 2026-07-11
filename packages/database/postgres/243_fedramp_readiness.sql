-- Sprint 243: FedRAMP Readiness
CREATE TABLE IF NOT EXISTS phase14_243_fedramp_readiness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase14_243_fedramp_readiness_tenant_status ON phase14_243_fedramp_readiness (tenant_id, status);
