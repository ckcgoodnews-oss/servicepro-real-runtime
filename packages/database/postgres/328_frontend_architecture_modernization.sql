-- Sprint 328: Frontend Architecture Modernization
CREATE TABLE IF NOT EXISTS phase20_328_frontend_architecture_modernization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase20_328_frontend_architecture_modernization_tenant_status ON phase20_328_frontend_architecture_modernization (tenant_id, status);
