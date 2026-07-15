CREATE INDEX IF NOT EXISTS idx_customer_assets_tenant_status_type ON customer_assets (tenant_id, status, asset_type);
CREATE INDEX IF NOT EXISTS idx_customer_assets_tenant_name_search ON customer_assets (tenant_id, lower(name));
CREATE INDEX IF NOT EXISTS idx_customer_assets_tenant_location ON customer_assets (tenant_id, location);
CREATE INDEX IF NOT EXISTS idx_media_attachments_asset_lookup ON media_attachments (tenant_id, entity_id, created_at DESC) WHERE entity_type = 'asset';
