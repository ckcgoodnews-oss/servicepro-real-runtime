-- Sprint 453: Tenant Upgrade Orchestration
CREATE TABLE IF NOT EXISTS phase28_453_tenant_upgrade_orchestration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  gate_required boolean NOT NULL DEFAULT true,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase28_453_tenant_upgrade_orchestration_tenant_status ON phase28_453_tenant_upgrade_orchestration (tenant_id, status);
