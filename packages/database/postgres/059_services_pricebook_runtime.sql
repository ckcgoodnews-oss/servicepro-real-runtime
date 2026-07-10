-- Sprint 59 PostgreSQL migration: service catalog and price-book runtime.

CREATE TABLE IF NOT EXISTS service_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'plumbing',
  base_price numeric(12,2) NOT NULL DEFAULT 0,
  unit_cost numeric(12,2) NOT NULL DEFAULT 0,
  taxable boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS pricebook_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  service_id uuid,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_catalog_tenant_category
ON service_catalog (tenant_id, category, active);

INSERT INTO service_catalog (tenant_id, code, name, description, category, base_price, unit_cost, taxable)
VALUES
  ('tenant_demo', 'DRAIN-CLEAN', 'Drain cleaning', 'Standard drain cleaning service', 'drain', 225, 85, true),
  ('tenant_demo', 'WH-DIAG', 'Water heater diagnostic', 'Diagnostic inspection for water heater issues', 'water_heater', 149, 45, true),
  ('tenant_demo', 'LEAK-SEARCH', 'Leak detection visit', 'Standard leak investigation and diagnosis', 'leak', 189, 65, true)
ON CONFLICT (tenant_id, code) DO NOTHING;
