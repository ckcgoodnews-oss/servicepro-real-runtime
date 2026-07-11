-- Sprint 263: Operational Resilience Exercises
CREATE TABLE IF NOT EXISTS phase15_263_operational_resilience_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase15_263_operational_resilience_exercises_tenant_status ON phase15_263_operational_resilience_exercises (tenant_id, status);
