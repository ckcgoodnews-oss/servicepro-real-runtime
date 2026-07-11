-- Sprint 331: Event Driven Architecture Foundation
CREATE TABLE IF NOT EXISTS phase20_331_event_driven_architecture_foundation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase20_331_event_driven_architecture_foundation_tenant_status ON phase20_331_event_driven_architecture_foundation (tenant_id, status);
