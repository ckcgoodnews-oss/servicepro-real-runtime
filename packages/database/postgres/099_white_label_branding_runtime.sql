-- Sprint 99 PostgreSQL migration: white-label branding runtime.

CREATE TABLE IF NOT EXISTS brand_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  legal_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  support_email text NOT NULL DEFAULT '',
  support_phone text NOT NULL DEFAULT '',
  website_url text NOT NULL DEFAULT '',
  default_locale text NOT NULL DEFAULT 'en-US',
  timezone text NOT NULL DEFAULT 'America/Indiana/Indianapolis',
  theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS brand_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  brand_id uuid NOT NULL,
  asset_type text NOT NULL,
  url text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  media_attachment_id uuid,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  brand_id uuid NOT NULL,
  hostname text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  is_primary boolean NOT NULL DEFAULT false,
  verification_token text NOT NULL DEFAULT '',
  verified_at timestamptz,
  ssl_status text NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, hostname)
);

CREATE INDEX IF NOT EXISTS idx_brand_profiles_tenant_status
ON brand_profiles (tenant_id, status, name);

CREATE INDEX IF NOT EXISTS idx_brand_assets_tenant_brand
ON brand_assets (tenant_id, brand_id, asset_type);

CREATE INDEX IF NOT EXISTS idx_tenant_domains_tenant_brand
ON tenant_domains (tenant_id, brand_id, hostname);

CREATE INDEX IF NOT EXISTS idx_tenant_domains_tenant_hostname
ON tenant_domains (tenant_id, hostname, status);
