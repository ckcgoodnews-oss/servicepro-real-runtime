-- Sprint 525: Tenant V5 Migration Dry Runs
CREATE TABLE IF NOT EXISTS phase33_525_tenant_v5_migration_dry_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  gate_required boolean NOT NULL DEFAULT true,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase33_525_tenant_v5_migration_dry_runs_tenant_status ON phase33_525_tenant_v5_migration_dry_runs (tenant_id, status);
