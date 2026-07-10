-- Sprint 62 PostgreSQL migration: inventory, stock adjustments, and job material usage.

CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  sku text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'parts',
  unit_cost numeric(12,2) NOT NULL DEFAULT 0,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  quantity_on_hand numeric(14,3) NOT NULL DEFAULT 0,
  reorder_point numeric(14,3) NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, sku)
);

CREATE TABLE IF NOT EXISTS stock_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  inventory_item_id uuid NOT NULL,
  quantity_delta numeric(14,3) NOT NULL,
  reason text NOT NULL DEFAULT 'manual_adjustment',
  reference text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_material_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  job_id uuid NOT NULL,
  inventory_item_id uuid NOT NULL,
  quantity numeric(14,3) NOT NULL,
  unit_cost numeric(12,2) NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant_category
ON inventory_items (tenant_id, category, active);

CREATE INDEX IF NOT EXISTS idx_stock_adjustments_tenant_item
ON stock_adjustments (tenant_id, inventory_item_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_material_usage_tenant_job
ON job_material_usage (tenant_id, job_id, used_at DESC);

INSERT INTO inventory_items (tenant_id, sku, name, description, category, unit_cost, unit_price, quantity_on_hand, reorder_point)
VALUES
  ('tenant_demo', 'PVC-TRAP-15', '1.5 inch PVC P-Trap', 'Standard PVC trap', 'drain_parts', 4.25, 14.99, 25, 5),
  ('tenant_demo', 'WH-SUPPLY-LINE', 'Water heater supply line', 'Braided supply line', 'water_heater_parts', 9.50, 29.99, 12, 4)
ON CONFLICT (tenant_id, sku) DO NOTHING;
