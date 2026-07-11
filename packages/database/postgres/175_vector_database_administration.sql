-- Sprint 175: Vector Database Administration
CREATE TABLE IF NOT EXISTS phase10_175_vector_database_administration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase10_175_vector_database_administration_tenant_status ON phase10_175_vector_database_administration (tenant_id, status);
