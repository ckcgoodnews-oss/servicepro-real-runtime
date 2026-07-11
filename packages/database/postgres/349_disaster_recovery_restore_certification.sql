-- Sprint 349: Disaster Recovery Restore Certification
CREATE TABLE IF NOT EXISTS phase21_349_disaster_recovery_restore_certification (
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
CREATE INDEX IF NOT EXISTS idx_phase21_349_disaster_recovery_restore_certification_tenant_status ON phase21_349_disaster_recovery_restore_certification (tenant_id, status);
