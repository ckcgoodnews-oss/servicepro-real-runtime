-- Sprint 202: Plugin SDK
CREATE TABLE IF NOT EXISTS phase12_202_plugin_sdk (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase12_202_plugin_sdk_tenant_status ON phase12_202_plugin_sdk (tenant_id, status);
