-- Sprint 79 PostgreSQL migration: vendors and purchasing.

CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  account_number text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  address1 text NOT NULL DEFAULT '',
  address2 text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT 'US',
  payment_terms text NOT NULL DEFAULT 'Net 30',
  active boolean NOT NULL DEFAULT true,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  purchase_order_number text NOT NULL,
  vendor_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  order_date date NOT NULL,
  expected_date date,
  received_date date,
  vendor_reference text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, purchase_order_number)
);

CREATE TABLE IF NOT EXISTS purchase_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  purchase_order_id uuid NOT NULL,
  received_date date NOT NULL,
  lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendors_tenant_active
ON vendors (tenant_id, active, name);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_vendor
ON purchase_orders (tenant_id, vendor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_status
ON purchase_orders (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_purchase_receipts_tenant_po
ON purchase_receipts (tenant_id, purchase_order_id, created_at DESC);
