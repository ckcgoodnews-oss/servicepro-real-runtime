-- Sprint 173: AI Workflow Builder
CREATE TABLE IF NOT EXISTS phase10_173_ai_workflow_builder (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase10_173_ai_workflow_builder_tenant_status ON phase10_173_ai_workflow_builder (tenant_id, status);
