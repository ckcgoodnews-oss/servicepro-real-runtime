-- Sprint 291: Currency Tax Localization
CREATE TABLE IF NOT EXISTS phase17_291_currency_tax_localization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase17_291_currency_tax_localization_tenant_status ON phase17_291_currency_tax_localization (tenant_id, status);
