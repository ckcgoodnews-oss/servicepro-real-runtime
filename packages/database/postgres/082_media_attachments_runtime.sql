-- Sprint 82 PostgreSQL migration: media attachments.

CREATE TABLE IF NOT EXISTS media_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  filename text NOT NULL,
  original_filename text NOT NULL DEFAULT '',
  mime_type text NOT NULL DEFAULT 'application/octet-stream',
  media_kind text NOT NULL DEFAULT 'binary',
  size_bytes bigint NOT NULL DEFAULT 0,
  storage_provider text NOT NULL DEFAULT 'local',
  storage_key text NOT NULL,
  checksum_sha256 text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  visibility text NOT NULL DEFAULT 'internal',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_attachments_tenant_entity
ON media_attachments (tenant_id, entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_media_attachments_tenant_kind
ON media_attachments (tenant_id, media_kind, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_media_attachments_storage_key
ON media_attachments (storage_key);
