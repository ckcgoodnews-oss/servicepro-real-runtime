-- Sprint 42 PostgreSQL migration: API metadata, request logs, and API contract tracking.

CREATE TABLE IF NOT EXISTS api_request_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  user_id uuid,
  request_id text NOT NULL,
  method text NOT NULL,
  path text NOT NULL,
  status_code integer,
  latency_ms integer,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS api_route_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method text NOT NULL,
  path text NOT NULL,
  permission_key text,
  tenant_scoped boolean NOT NULL DEFAULT true,
  description text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (method, path)
);

CREATE TABLE IF NOT EXISTS api_validation_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  user_id uuid,
  request_id text,
  route text NOT NULL,
  issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_request_logs_tenant_time
ON api_request_logs (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_request_logs_request_id
ON api_request_logs (request_id);

CREATE INDEX IF NOT EXISTS idx_api_validation_failures_tenant_time
ON api_validation_failures (tenant_id, created_at DESC);
