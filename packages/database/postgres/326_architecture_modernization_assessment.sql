-- Sprint 326: Architecture Modernization Assessment
CREATE TABLE IF NOT EXISTS phase20_326_architecture_modernization_assessment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase20_326_architecture_modernization_assessment_tenant_status ON phase20_326_architecture_modernization_assessment (tenant_id, status);
