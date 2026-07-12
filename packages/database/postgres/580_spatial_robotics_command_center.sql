-- Sprint 580: Spatial Robotics Command Center
CREATE TABLE IF NOT EXISTS phase36_spatial_robotics_command_center_records (
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
CREATE INDEX IF NOT EXISTS idx_phase36_spatial_robotics_command_center_tenant_status ON phase36_spatial_robotics_command_center_records (tenant_id,status);
