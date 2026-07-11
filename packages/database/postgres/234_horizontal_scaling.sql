-- Sprint 234: Horizontal Scaling
CREATE TABLE IF NOT EXISTS phase14_234_horizontal_scaling (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase14_234_horizontal_scaling_tenant_status ON phase14_234_horizontal_scaling (tenant_id, status);
