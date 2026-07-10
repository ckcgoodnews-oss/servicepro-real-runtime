-- Sprint 98 PostgreSQL migration: business intelligence dashboard runtime.

CREATE TABLE IF NOT EXISTS bi_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'custom',
  active boolean NOT NULL DEFAULT true,
  role_visibility jsonb NOT NULL DEFAULT '[]'::jsonb,
  layout jsonb NOT NULL DEFAULT '{}'::jsonb,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS bi_dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  dashboard_id uuid NOT NULL,
  title text NOT NULL,
  widget_type text NOT NULL DEFAULT 'kpi',
  metric_key text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  width integer NOT NULL DEFAULT 4,
  height integer NOT NULL DEFAULT 2,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bi_metric_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  metric_key text NOT NULL,
  label text NOT NULL,
  value numeric(18,4) NOT NULL DEFAULT 0,
  value_type text NOT NULL DEFAULT 'number',
  previous_value numeric(18,4),
  target_value numeric(18,4),
  percent_change numeric(12,4),
  target_progress_percent numeric(12,4),
  period_start date,
  period_end date,
  dimensions jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'manual',
  captured_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bi_dashboards_tenant_category
ON bi_dashboards (tenant_id, category, active);

CREATE INDEX IF NOT EXISTS idx_bi_widgets_tenant_dashboard
ON bi_dashboard_widgets (tenant_id, dashboard_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_bi_metrics_tenant_key_captured
ON bi_metric_snapshots (tenant_id, metric_key, captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_bi_metrics_tenant_source_captured
ON bi_metric_snapshots (tenant_id, source, captured_at DESC);
