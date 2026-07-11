-- Sprint 171: Enterprise Prompt Library
CREATE TABLE IF NOT EXISTS phase10_171_enterprise_prompt_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase10_171_enterprise_prompt_library_tenant_status ON phase10_171_enterprise_prompt_library (tenant_id, status);
