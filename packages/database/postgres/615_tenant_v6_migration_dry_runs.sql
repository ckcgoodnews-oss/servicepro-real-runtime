-- Sprint 615: Tenant V6 Migration Dry Runs
CREATE TABLE IF NOT EXISTS phase39_tenant_v6_migration_dry_runs_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase39_tenant_v6_migration_dry_runs_tenant_status ON phase39_tenant_v6_migration_dry_runs_records (tenant_id,status);
