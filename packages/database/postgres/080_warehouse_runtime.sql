-- Sprint 80 PostgreSQL migration: warehouses, bins, and inventory transfers.

CREATE TABLE IF NOT EXISTS warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  warehouse_type text NOT NULL DEFAULT 'main',
  address1 text NOT NULL DEFAULT '',
  address2 text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT 'US',
  active boolean NOT NULL DEFAULT true,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS warehouse_bins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  warehouse_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, warehouse_id, code)
);

CREATE TABLE IF NOT EXISTS inventory_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  from_warehouse_id uuid NOT NULL,
  from_bin_id uuid,
  to_warehouse_id uuid NOT NULL,
  to_bin_id uuid,
  status text NOT NULL DEFAULT 'draft',
  transfer_date date NOT NULL,
  completed_date date,
  reference text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_warehouses_tenant_active
ON warehouses (tenant_id, active, name);

CREATE INDEX IF NOT EXISTS idx_warehouse_bins_tenant_wh
ON warehouse_bins (tenant_id, warehouse_id, active, sort_order);

CREATE INDEX IF NOT EXISTS idx_inventory_transfers_tenant_status
ON inventory_transfers (tenant_id, status, created_at DESC);
