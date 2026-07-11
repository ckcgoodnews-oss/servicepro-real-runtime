-- Sprint 338: Version3 Migration Assistant
CREATE TABLE IF NOT EXISTS phase20_338_version3_migration_assistant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase20_338_version3_migration_assistant_tenant_status ON phase20_338_version3_migration_assistant (tenant_id, status);
