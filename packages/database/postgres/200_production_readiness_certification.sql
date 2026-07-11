-- Sprint 200: Production Readiness Certification
CREATE TABLE IF NOT EXISTS phase11_200_production_readiness_certification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase11_200_production_readiness_certification_tenant_status ON phase11_200_production_readiness_certification (tenant_id, status);
