BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS platform_tenant_admin_records (
  tenant_id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'active',
  plan text NOT NULL DEFAULT 'manual',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  feature_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  branding jsonb NOT NULL DEFAULT '{}'::jsonb,
  storage_bytes bigint NOT NULL DEFAULT 0,
  archived_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_tenant_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  domain text NOT NULL,
  status text NOT NULL DEFAULT 'pending_dns',
  ssl_status text NOT NULL DEFAULT 'pending',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS platform_tenant_domains_live_domain_idx
  ON platform_tenant_domains (lower(domain))
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS platform_tenant_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  key_hash text NOT NULL,
  last_four text NOT NULL,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_tenant_admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  actor_id text NOT NULL DEFAULT '',
  action text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS platform_tenant_admin_audit_tenant_created_idx
  ON platform_tenant_admin_audit (tenant_id, created_at DESC);
COMMIT;
