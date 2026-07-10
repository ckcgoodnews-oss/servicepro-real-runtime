-- Sprint 77 PostgreSQL migration: customer assets and equipment service history.

CREATE TABLE IF NOT EXISTS customer_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_id uuid NOT NULL,
  job_id uuid,
  asset_type text NOT NULL,
  name text NOT NULL,
  manufacturer text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  serial_number text NOT NULL DEFAULT '',
  installed_date date,
  warranty_expires_at date,
  location text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  notes text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS asset_service_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  asset_id uuid NOT NULL,
  job_id uuid,
  service_date date NOT NULL,
  event_type text NOT NULL DEFAULT 'service',
  summary text NOT NULL DEFAULT '',
  technician_id uuid,
  notes text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_assets_tenant_customer
ON customer_assets (tenant_id, customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_assets_tenant_serial
ON customer_assets (tenant_id, serial_number);

CREATE INDEX IF NOT EXISTS idx_asset_service_history_tenant_asset
ON asset_service_history (tenant_id, asset_id, service_date DESC);
