CREATE TABLE IF NOT EXISTS organization_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('organization','business_unit','department','location','team')),
  name text NOT NULL, code text NOT NULL DEFAULT '', parent_id uuid REFERENCES organization_units(id) ON DELETE RESTRICT,
  description text NOT NULL DEFAULT '', address text NOT NULL DEFAULT '', timezone text NOT NULL DEFAULT 'America/Indiana/Indianapolis',
  active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, type, name)
);
CREATE INDEX IF NOT EXISTS idx_organization_units_tenant_type ON organization_units (tenant_id, type, active);
CREATE INDEX IF NOT EXISTS idx_organization_units_parent ON organization_units (tenant_id, parent_id);
