-- Sprint 190: Rate Limiting
CREATE TABLE IF NOT EXISTS phase11_190_rate_limiting (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase11_190_rate_limiting_tenant_status ON phase11_190_rate_limiting (tenant_id, status);
