-- Sprint 106 PostgreSQL migration: marketplace and integration runtime.

CREATE TABLE IF NOT EXISTS integration_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  provider text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  auth_type text NOT NULL DEFAULT 'none',
  supported_events jsonb NOT NULL DEFAULT '[]'::jsonb,
  supported_objects jsonb NOT NULL DEFAULT '[]'::jsonb,
  documentation_url text NOT NULL DEFAULT '',
  icon_url text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integration_installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  integration_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  connection_status text NOT NULL DEFAULT 'unknown',
  installed_by text NOT NULL DEFAULT '',
  installed_at timestamptz NOT NULL,
  last_connected_at timestamptz,
  last_error text NOT NULL DEFAULT '',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  secret_ref text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  installation_id uuid NOT NULL,
  event_name text NOT NULL,
  target_url text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  signing_secret_ref text NOT NULL DEFAULT '',
  last_delivered_at timestamptz,
  failure_count integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Migration 045 created a smaller webhook_subscriptions table. Upgrade that
-- legacy shape before the runtime indexes below reference the newer columns.
ALTER TABLE webhook_subscriptions
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN tenant_id TYPE text USING tenant_id::text,
  ADD COLUMN IF NOT EXISTS installation_id uuid,
  ADD COLUMN IF NOT EXISTS event_name text,
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS signing_secret_ref text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS failure_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'webhook_subscriptions' AND column_name = 'event'
  ) THEN
    EXECUTE 'UPDATE webhook_subscriptions SET event_name = COALESCE(event_name, event)';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'webhook_subscriptions' AND column_name = 'enabled'
  ) THEN
    EXECUTE 'UPDATE webhook_subscriptions SET status = COALESCE(status, CASE WHEN enabled THEN ''active'' ELSE ''disabled'' END)';
  END IF;
END $$;

UPDATE webhook_subscriptions
SET installation_id = COALESCE(installation_id, gen_random_uuid()),
    event_name = COALESCE(event_name, ''),
    target_url = COALESCE(target_url, ''),
    status = COALESCE(status, 'active');

ALTER TABLE webhook_subscriptions
  ALTER COLUMN tenant_id SET NOT NULL,
  ALTER COLUMN installation_id SET NOT NULL,
  ALTER COLUMN event_name SET NOT NULL,
  ALTER COLUMN target_url SET NOT NULL,
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'active';

CREATE TABLE IF NOT EXISTS integration_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  installation_id uuid NOT NULL,
  object_type text NOT NULL,
  direction text NOT NULL DEFAULT 'bidirectional',
  status text NOT NULL DEFAULT 'queued',
  started_at timestamptz,
  completed_at timestamptz,
  records_read integer NOT NULL DEFAULT 0,
  records_written integer NOT NULL DEFAULT 0,
  records_failed integer NOT NULL DEFAULT 0,
  cursor text NOT NULL DEFAULT '',
  error_message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integration_catalog_status_category
ON integration_catalog (status, category, name);

CREATE INDEX IF NOT EXISTS idx_integration_installations_tenant_status
ON integration_installations (tenant_id, status, connection_status, installed_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_tenant_installation
ON webhook_subscriptions (tenant_id, installation_id, status);

CREATE INDEX IF NOT EXISTS idx_integration_sync_runs_tenant_installation
ON integration_sync_runs (tenant_id, installation_id, status, created_at DESC);
