-- Sprint 289: Global Notification Localization
CREATE TABLE IF NOT EXISTS phase17_289_global_notification_localization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase17_289_global_notification_localization_tenant_status ON phase17_289_global_notification_localization (tenant_id, status);
