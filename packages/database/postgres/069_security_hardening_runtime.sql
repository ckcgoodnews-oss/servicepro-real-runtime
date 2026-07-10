-- Sprint 69 PostgreSQL migration: security hardening events.

CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  event_type text NOT NULL DEFAULT 'security.event',
  subject text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'info',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  rate_key text NOT NULL DEFAULT '',
  route text NOT NULL DEFAULT '',
  method text NOT NULL DEFAULT '',
  limit_value integer NOT NULL DEFAULT 0,
  observed_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_events_tenant_time
ON security_events (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_tenant_type
ON security_events (tenant_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_tenant_time
ON rate_limit_events (tenant_id, created_at DESC);
