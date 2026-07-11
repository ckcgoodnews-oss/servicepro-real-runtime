-- Sprint 346: Performance Load Certification
CREATE TABLE IF NOT EXISTS phase21_346_performance_load_certification (
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
CREATE INDEX IF NOT EXISTS idx_phase21_346_performance_load_certification_tenant_status ON phase21_346_performance_load_certification (tenant_id, status);
