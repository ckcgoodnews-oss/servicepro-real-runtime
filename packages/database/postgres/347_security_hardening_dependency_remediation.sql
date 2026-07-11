-- Sprint 347: Security Hardening Dependency Remediation
CREATE TABLE IF NOT EXISTS phase21_347_security_hardening_dependency_remediation (
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
CREATE INDEX IF NOT EXISTS idx_phase21_347_security_hardening_dependency_remediation_tenant_status ON phase21_347_security_hardening_dependency_remediation (tenant_id, status);
