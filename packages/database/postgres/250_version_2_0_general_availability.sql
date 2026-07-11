-- Sprint 250: Version 2.0 General Availability
CREATE TABLE IF NOT EXISTS phase14_250_version_2_0_general_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase14_250_version_2_0_general_availability_tenant_status ON phase14_250_version_2_0_general_availability (tenant_id, status);
