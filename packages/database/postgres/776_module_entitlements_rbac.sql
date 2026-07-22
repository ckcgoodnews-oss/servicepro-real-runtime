CREATE TABLE IF NOT EXISTS tenant_module_entitlements (
  tenant_id text PRIMARY KEY,
  enabled_modules jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE runtime_users ADD COLUMN IF NOT EXISTS module_permissions jsonb NOT NULL DEFAULT '[]'::jsonb;
