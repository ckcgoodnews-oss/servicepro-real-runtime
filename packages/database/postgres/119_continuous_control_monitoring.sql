-- Sprint 119 PostgreSQL migration: continuous control monitoring runtime.

CREATE TABLE IF NOT EXISTS control_monitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  monitor_type text NOT NULL DEFAULT 'threshold',
  source_system text NOT NULL DEFAULT '',
  signal_name text NOT NULL DEFAULT '',
  threshold numeric(18,4),
  operator text NOT NULL DEFAULT 'gte',
  evaluation_window_minutes integer NOT NULL DEFAULT 60,
  severity text NOT NULL DEFAULT 'medium',
  owner text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS control_monitor_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id uuid NOT NULL,
  signal_name text NOT NULL,
  value jsonb,
  numeric_value numeric(18,4),
  status text NOT NULL DEFAULT 'received',
  observed_at timestamptz NOT NULL,
  source_system text NOT NULL DEFAULT '',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS control_health_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id uuid NOT NULL,
  control_id text NOT NULL DEFAULT '',
  health_status text NOT NULL DEFAULT 'unknown',
  evaluated_at timestamptz NOT NULL,
  score numeric(8,2) NOT NULL DEFAULT 0,
  reason text NOT NULL DEFAULT '',
  signal_count integer NOT NULL DEFAULT 0,
  failing_signal_count integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS control_monitor_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id uuid NOT NULL,
  control_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  opened_at timestamptz NOT NULL,
  acknowledged_by text NOT NULL DEFAULT '',
  acknowledged_at timestamptz,
  resolved_by text NOT NULL DEFAULT '',
  resolved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS control_monitor_suppressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  reason text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  created_by text NOT NULL DEFAULT '',
  revoked_by text NOT NULL DEFAULT '',
  revoked_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_control_monitors_control_status ON control_monitors (control_id, status);
CREATE INDEX IF NOT EXISTS idx_control_signals_monitor_observed ON control_monitor_signals (monitor_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_control_evaluations_monitor_health ON control_health_evaluations (monitor_id, health_status, evaluated_at DESC);
CREATE INDEX IF NOT EXISTS idx_control_alerts_monitor_status ON control_monitor_alerts (monitor_id, status, severity, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_control_suppressions_monitor_status ON control_monitor_suppressions (monitor_id, status, starts_at, ends_at);
