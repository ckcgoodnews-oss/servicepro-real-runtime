-- Sprint 290: Timezone Calendar Localization
CREATE TABLE IF NOT EXISTS phase17_290_timezone_calendar_localization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase17_290_timezone_calendar_localization_tenant_status ON phase17_290_timezone_calendar_localization (tenant_id, status);
