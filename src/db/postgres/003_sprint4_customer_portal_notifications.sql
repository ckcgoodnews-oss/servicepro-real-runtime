CREATE TABLE IF NOT EXISTS customer_magic_links (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_queue (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id TEXT NULL REFERENCES customers(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK(channel IN ('email','sms','internal')),
  "to" TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  related_type TEXT,
  related_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','sent','failed','cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMP NULL,
  last_error TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK(document_type IN ('estimate','invoice')),
  document_id TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_magic_links_tenant_customer ON customer_magic_links(tenant_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_tenant_status ON notification_queue(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_document_events_tenant_doc ON document_events(tenant_id, document_type, document_id);
