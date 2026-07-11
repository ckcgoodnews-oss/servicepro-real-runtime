-- Sprint 277: Ai Quality Evaluation
CREATE TABLE IF NOT EXISTS phase16_277_ai_quality_evaluation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase16_277_ai_quality_evaluation_tenant_status ON phase16_277_ai_quality_evaluation (tenant_id, status);
