-- Sprint 311: Custom Object Framework
CREATE TABLE IF NOT EXISTS phase19_311_custom_object_framework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase19_311_custom_object_framework_tenant_status ON phase19_311_custom_object_framework (tenant_id, status);
