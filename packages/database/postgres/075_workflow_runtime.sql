-- Sprint 75 PostgreSQL migration: workflow automation runtime.

CREATE TABLE IF NOT EXISTS workflow_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  entity_type text NOT NULL DEFAULT 'job',
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  definition jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, entity_type)
);

CREATE TABLE IF NOT EXISTS workflow_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  entity_type text NOT NULL DEFAULT 'job',
  entity_id text NOT NULL DEFAULT '',
  from_status text NOT NULL DEFAULT '',
  to_status text NOT NULL DEFAULT '',
  actor_id text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workflow_rules_tenant_entity
ON workflow_rules (tenant_id, entity_type);

CREATE INDEX IF NOT EXISTS idx_workflow_events_tenant_entity
ON workflow_events (tenant_id, entity_type, entity_id, created_at DESC);

INSERT INTO workflow_rules (tenant_id, entity_type, name, active, definition)
VALUES (
  'tenant_demo',
  'job',
  'Default Job Workflow',
  true,
  '{
    "entityType":"job",
    "states":["open","scheduled","dispatched","in_progress","completed","invoiced","closed","cancelled"],
    "transitions":{
      "open":["scheduled","dispatched","cancelled"],
      "scheduled":["dispatched","in_progress","cancelled"],
      "dispatched":["in_progress","completed","cancelled"],
      "in_progress":["completed","cancelled"],
      "completed":["invoiced","closed"],
      "invoiced":["closed"],
      "closed":[],
      "cancelled":[]
    }
  }'::jsonb
)
ON CONFLICT (tenant_id, entity_type) DO NOTHING;
