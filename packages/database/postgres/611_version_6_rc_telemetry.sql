-- Sprint 611: Version 6 Rc Telemetry
CREATE TABLE IF NOT EXISTS phase39_version_6_rc_telemetry_records (
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
CREATE INDEX IF NOT EXISTS idx_phase39_version_6_rc_telemetry_tenant_status ON phase39_version_6_rc_telemetry_records (tenant_id,status);
