-- Sprint 44 PostgreSQL migration: core service metadata and domain events.

CREATE TABLE IF NOT EXISTS domain_event_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  event_type text NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE TABLE IF NOT EXISTS service_operation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  service_name text NOT NULL,
  operation_name text NOT NULL,
  actor_id uuid,
  entity_type text,
  entity_id uuid,
  status text NOT NULL DEFAULT 'success',
  latency_ms integer,
  error_message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_calculation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  calculation_type text NOT NULL,
  input_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_domain_event_outbox_status
ON domain_event_outbox (status, created_at);

CREATE INDEX IF NOT EXISTS idx_service_operation_logs_tenant_service
ON service_operation_logs (tenant_id, service_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pricing_calculation_logs_tenant
ON pricing_calculation_logs (tenant_id, created_at DESC);
