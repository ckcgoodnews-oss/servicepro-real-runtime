-- Sprint 212: Desktop Synchronization
CREATE TABLE IF NOT EXISTS phase12_212_desktop_synchronization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase12_212_desktop_synchronization_tenant_status ON phase12_212_desktop_synchronization (tenant_id, status);
