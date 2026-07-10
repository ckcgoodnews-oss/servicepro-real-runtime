-- Sprint 97 PostgreSQL migration: mobile device offline sync.

CREATE TABLE IF NOT EXISTS mobile_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  user_id text NOT NULL,
  technician_id uuid,
  device_name text NOT NULL,
  device_platform text NOT NULL DEFAULT 'unknown',
  app_version text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  device_token text NOT NULL,
  last_seen_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, device_token)
);

CREATE TABLE IF NOT EXISTS mobile_sync_cursors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  device_id uuid NOT NULL,
  last_pulled_at timestamptz,
  last_pushed_at timestamptz,
  last_server_version bigint NOT NULL DEFAULT 0,
  entity_versions jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, device_id)
);

CREATE TABLE IF NOT EXISTS offline_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  device_id uuid NOT NULL,
  technician_id uuid,
  client_change_id text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  operation text NOT NULL DEFAULT 'update',
  status text NOT NULL DEFAULT 'queued',
  base_version bigint NOT NULL DEFAULT 0,
  client_version bigint NOT NULL DEFAULT 0,
  server_version bigint NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  conflict_reason text NOT NULL DEFAULT '',
  resolution text NOT NULL DEFAULT '',
  received_at timestamptz NOT NULL,
  applied_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, device_id, client_change_id)
);

CREATE INDEX IF NOT EXISTS idx_mobile_devices_tenant_user
ON mobile_devices (tenant_id, user_id, status);

CREATE INDEX IF NOT EXISTS idx_mobile_devices_tenant_technician
ON mobile_devices (tenant_id, technician_id, status);

CREATE INDEX IF NOT EXISTS idx_offline_changes_tenant_device
ON offline_changes (tenant_id, device_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_offline_changes_tenant_status
ON offline_changes (tenant_id, status, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_offline_changes_tenant_entity
ON offline_changes (tenant_id, entity_type, entity_id);
