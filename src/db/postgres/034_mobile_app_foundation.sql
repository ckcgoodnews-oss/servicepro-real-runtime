-- Sprint 34 PostgreSQL migration: mobile app, offline queue, camera, barcode, signatures, and push.

CREATE TABLE IF NOT EXISTS mobile_app_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name text NOT NULL,
  platform text NOT NULL,
  version_name text NOT NULL,
  build_number integer NOT NULL,
  release_channel text NOT NULL DEFAULT 'stable',
  minimum_supported_version text,
  release_notes text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mobile_api_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  device_id uuid,
  session_token_hash text NOT NULL,
  refresh_token_hash text,
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);

CREATE TABLE IF NOT EXISTS offline_mutation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  device_id uuid,
  client_mutation_id text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  operation text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'queued',
  conflict_status text NOT NULL DEFAULT 'none',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  error_message text NOT NULL DEFAULT '',
  UNIQUE (tenant_id, device_id, client_mutation_id)
);

CREATE TABLE IF NOT EXISTS mobile_sync_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  mutation_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  server_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  client_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolution_strategy text NOT NULL DEFAULT 'manual',
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS camera_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  job_id uuid,
  technician_id uuid,
  upload_file_id uuid,
  capture_type text NOT NULL DEFAULT 'job_photo',
  latitude numeric(10,7),
  longitude numeric(10,7),
  captured_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS barcode_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  technician_id uuid,
  job_id uuid,
  scanned_value text NOT NULL,
  barcode_type text NOT NULL DEFAULT 'unknown',
  related_entity_type text,
  related_entity_id uuid,
  scanned_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS customer_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  customer_id uuid,
  job_id uuid,
  estimate_id uuid,
  invoice_id uuid,
  signer_name text NOT NULL,
  signature_file_id uuid,
  signature_hash text,
  ip_address text,
  signed_at timestamptz NOT NULL DEFAULT now(),
  consent_text text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS push_notification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  device_id uuid,
  provider text NOT NULL,
  token text NOT NULL,
  platform text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, provider, token)
);

CREATE TABLE IF NOT EXISTS push_notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid,
  token_id uuid,
  notification_type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'queued',
  provider_message_id text,
  error_message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_mobile_api_sessions_user
ON mobile_api_sessions (tenant_id, user_id, expires_at DESC);

CREATE INDEX IF NOT EXISTS idx_offline_mutation_queue_status
ON offline_mutation_queue (tenant_id, status, submitted_at);

CREATE INDEX IF NOT EXISTS idx_mobile_sync_conflicts_tenant
ON mobile_sync_conflicts (tenant_id, entity_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_camera_captures_job
ON camera_captures (tenant_id, job_id, captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_barcode_scans_value
ON barcode_scans (tenant_id, scanned_value, scanned_at DESC);

CREATE INDEX IF NOT EXISTS idx_push_deliveries_status
ON push_notification_deliveries (tenant_id, status, created_at DESC);
