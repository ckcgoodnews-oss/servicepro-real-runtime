-- Sprint 104 PostgreSQL migration: observability and incident management runtime.

CREATE TABLE IF NOT EXISTS service_monitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  service_name text NOT NULL,
  monitor_type text NOT NULL DEFAULT 'http',
  status text NOT NULL DEFAULT 'active',
  target text NOT NULL DEFAULT '',
  check_interval_seconds integer NOT NULL DEFAULT 60,
  timeout_seconds integer NOT NULL DEFAULT 10,
  owner_team text NOT NULL DEFAULT 'platform',
  escalation_policy text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS service_slos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  service_name text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  target_percent numeric(8,4) NOT NULL DEFAULT 99.9,
  window text NOT NULL DEFAULT '30d',
  measurement_type text NOT NULL DEFAULT 'availability',
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS alert_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  monitor_id uuid NOT NULL,
  incident_id uuid,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'warning',
  status text NOT NULL DEFAULT 'open',
  observed_value text,
  threshold_value text,
  opened_at timestamptz NOT NULL,
  acknowledged_by text NOT NULL DEFAULT '',
  acknowledged_at timestamptz,
  resolved_by text NOT NULL DEFAULT '',
  resolved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'sev3',
  status text NOT NULL DEFAULT 'open',
  impacted_services jsonb NOT NULL DEFAULT '[]'::jsonb,
  commander text NOT NULL DEFAULT '',
  opened_at timestamptz NOT NULL,
  mitigated_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  root_cause text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS incident_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  incident_id uuid NOT NULL,
  event_type text NOT NULL,
  message text NOT NULL DEFAULT '',
  actor text NOT NULL DEFAULT '',
  occurred_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_monitors_tenant_service ON service_monitors (tenant_id, service_name, status);
CREATE INDEX IF NOT EXISTS idx_service_slos_tenant_service ON service_slos (tenant_id, service_name, active);
CREATE INDEX IF NOT EXISTS idx_alert_events_tenant_status ON alert_events (tenant_id, status, severity, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_tenant_status ON incidents (tenant_id, status, severity, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_incident_timeline_tenant_incident ON incident_timeline_events (tenant_id, incident_id, occurred_at);
