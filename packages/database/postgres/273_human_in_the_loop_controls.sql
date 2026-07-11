-- Sprint 273: Human In The Loop Controls
CREATE TABLE IF NOT EXISTS phase16_273_human_in_the_loop_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase16_273_human_in_the_loop_controls_tenant_status ON phase16_273_human_in_the_loop_controls (tenant_id, status);
