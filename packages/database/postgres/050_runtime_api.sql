-- Sprint 50 PostgreSQL migration: runtime API operational metadata.

CREATE TABLE IF NOT EXISTS api_runtime_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_name text NOT NULL,
  version text NOT NULL DEFAULT '0.50.0',
  started_at timestamptz NOT NULL DEFAULT now(),
  last_heartbeat_at timestamptz
);

CREATE TABLE IF NOT EXISTS api_runtime_request_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  user_id uuid,
  method text NOT NULL,
  path text NOT NULL,
  status_code integer,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_runtime_request_audit_tenant_time
ON api_runtime_request_audit (tenant_id, created_at DESC);
