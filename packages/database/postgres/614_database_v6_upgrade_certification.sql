-- Sprint 614: Database V6 Upgrade Certification
CREATE TABLE IF NOT EXISTS phase39_database_v6_upgrade_certification_records (
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
CREATE INDEX IF NOT EXISTS idx_phase39_database_v6_upgrade_certification_tenant_status ON phase39_database_v6_upgrade_certification_records (tenant_id,status);
