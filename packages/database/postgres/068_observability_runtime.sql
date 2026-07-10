-- Sprint 68 PostgreSQL migration: observability request metrics.

CREATE TABLE IF NOT EXISTS request_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  request_id text NOT NULL DEFAULT '',
  method text NOT NULL DEFAULT '',
  route text NOT NULL DEFAULT '',
  status_code integer NOT NULL DEFAULT 0,
  duration_ms integer NOT NULL DEFAULT 0,
  actor_id text NOT NULL DEFAULT '',
  actor_type text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_request_metrics_tenant_time
ON request_metrics (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_request_metrics_tenant_route
ON request_metrics (tenant_id, route, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_request_metrics_tenant_status
ON request_metrics (tenant_id, status_code, created_at DESC);
