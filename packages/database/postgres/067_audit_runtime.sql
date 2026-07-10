-- Sprint 67 PostgreSQL migration: audit runtime.

CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  event_type text NOT NULL DEFAULT 'activity',
  actor_type text NOT NULL DEFAULT 'system',
  actor_id text NOT NULL DEFAULT '',
  entity_type text NOT NULL DEFAULT '',
  entity_id text NOT NULL DEFAULT '',
  action text NOT NULL DEFAULT '',
  route text NOT NULL DEFAULT '',
  method text NOT NULL DEFAULT '',
  status_code integer NOT NULL DEFAULT 0,
  duration_ms integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_tenant_time
ON audit_events (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_tenant_entity
ON audit_events (tenant_id, entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_tenant_actor
ON audit_events (tenant_id, actor_type, actor_id, created_at DESC);
