CREATE TABLE IF NOT EXISTS report_schedules(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id text NOT NULL,report_key text NOT NULL,
  frequency text NOT NULL CHECK(frequency IN('daily','weekly','monthly')),format text NOT NULL DEFAULT 'csv',
  recipients jsonb NOT NULL DEFAULT '[]'::jsonb,next_run_at timestamptz,last_run_at timestamptz,
  active boolean NOT NULL DEFAULT true,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_report_schedules_due ON report_schedules(tenant_id,active,next_run_at) WHERE active=true;
