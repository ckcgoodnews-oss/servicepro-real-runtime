-- Sprint 213: Mobile SDK
CREATE TABLE IF NOT EXISTS phase12_213_mobile_sdk (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase12_213_mobile_sdk_tenant_status ON phase12_213_mobile_sdk (tenant_id, status);
