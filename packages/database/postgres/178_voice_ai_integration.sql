-- Sprint 178: Voice AI Integration
CREATE TABLE IF NOT EXISTS phase10_178_voice_ai_integration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase10_178_voice_ai_integration_tenant_status ON phase10_178_voice_ai_integration (tenant_id, status);
