-- Sprint 211: Template Marketplace
CREATE TABLE IF NOT EXISTS phase12_211_template_marketplace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase12_211_template_marketplace_tenant_status ON phase12_211_template_marketplace (tenant_id, status);
