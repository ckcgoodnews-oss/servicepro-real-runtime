-- Sprint 228: Data Lineage
CREATE TABLE IF NOT EXISTS phase13_228_data_lineage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase13_228_data_lineage_tenant_status ON phase13_228_data_lineage (tenant_id, status);
