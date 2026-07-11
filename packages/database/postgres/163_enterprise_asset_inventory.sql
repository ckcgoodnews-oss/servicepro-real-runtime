CREATE TABLE IF NOT EXISTS enterprise_assets(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, asset_tag text NOT NULL, name text NOT NULL,
  type text NOT NULL, owner text NOT NULL, custodian text NOT NULL DEFAULT '', department text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active', manufacturer text NOT NULL DEFAULT '', model text NOT NULL DEFAULT '',
  serial_number text NOT NULL DEFAULT '', location text NOT NULL DEFAULT '', purchased_at timestamptz,
  warranty_expires_at timestamptz, end_of_life_at timestamptz, retired_at timestamptz, disposed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_enterprise_assets_tag UNIQUE(tenant_id,asset_tag),
  CONSTRAINT uq_enterprise_assets_tenant_id UNIQUE(tenant_id,id)
);
CREATE TABLE IF NOT EXISTS asset_software(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, asset_id uuid NOT NULL, product text NOT NULL,
  version text NOT NULL, publisher text NOT NULL DEFAULT '', license_key_ref text NOT NULL DEFAULT '', installed_at timestamptz,
  end_of_support_at timestamptz, status text NOT NULL DEFAULT 'installed', created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_asset_software_asset_tenant FOREIGN KEY(tenant_id,asset_id) REFERENCES enterprise_assets(tenant_id,id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS saas_subscriptions(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, provider text NOT NULL, product text NOT NULL,
  owner text NOT NULL, seats int NOT NULL DEFAULT 0 CHECK(seats>=0), annual_cost numeric NOT NULL DEFAULT 0 CHECK(annual_cost>=0),
  renewal_at timestamptz, status text NOT NULL DEFAULT 'active', data_classification text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_asset_lifecycle ON enterprise_assets(tenant_id,status,end_of_life_at,warranty_expires_at);
CREATE INDEX IF NOT EXISTS idx_asset_software_parent ON asset_software(tenant_id,asset_id);
CREATE INDEX IF NOT EXISTS idx_saas_renewal ON saas_subscriptions(tenant_id,status,renewal_at);
