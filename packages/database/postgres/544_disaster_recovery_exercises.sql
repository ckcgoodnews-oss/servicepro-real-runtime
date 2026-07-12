-- Sprint 544: Disaster Recovery Exercises
CREATE TABLE IF NOT EXISTS phase34_disaster_recovery_exercises_records (
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
CREATE INDEX IF NOT EXISTS idx_phase34_disaster_recovery_exercises_tenant_status ON phase34_disaster_recovery_exercises_records (tenant_id,status);
