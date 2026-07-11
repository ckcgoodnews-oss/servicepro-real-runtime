-- Sprint 224: Scheduled Reports
CREATE TABLE IF NOT EXISTS phase13_224_scheduled_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase13_224_scheduled_reports_tenant_status ON phase13_224_scheduled_reports (tenant_id, status);
