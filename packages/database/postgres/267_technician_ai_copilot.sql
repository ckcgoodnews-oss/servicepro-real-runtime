-- Sprint 267: Technician Ai Copilot
CREATE TABLE IF NOT EXISTS phase16_267_technician_ai_copilot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase16_267_technician_ai_copilot_tenant_status ON phase16_267_technician_ai_copilot (tenant_id, status);
