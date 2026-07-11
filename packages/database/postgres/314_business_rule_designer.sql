-- Sprint 314: Business Rule Designer
CREATE TABLE IF NOT EXISTS phase19_314_business_rule_designer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase19_314_business_rule_designer_tenant_status ON phase19_314_business_rule_designer (tenant_id, status);
