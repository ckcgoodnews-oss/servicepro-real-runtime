-- Sprint 275: Ai Memory Management
CREATE TABLE IF NOT EXISTS phase16_275_ai_memory_management (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase16_275_ai_memory_management_tenant_status ON phase16_275_ai_memory_management (tenant_id, status);
