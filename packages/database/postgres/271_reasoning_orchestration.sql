-- Sprint 271: Reasoning Orchestration
CREATE TABLE IF NOT EXISTS phase16_271_reasoning_orchestration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase16_271_reasoning_orchestration_tenant_status ON phase16_271_reasoning_orchestration (tenant_id, status);
