-- Sprint 334: Security Architecture V3
CREATE TABLE IF NOT EXISTS phase20_334_security_architecture_v3 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase20_334_security_architecture_v3_tenant_status ON phase20_334_security_architecture_v3 (tenant_id, status);
