-- Sprint 64 PostgreSQL migration: notification templates and queue.

CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  template_key text NOT NULL,
  name text NOT NULL,
  channel text NOT NULL,
  subject text NOT NULL DEFAULT '',
  body text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, template_key)
);

CREATE TABLE IF NOT EXISTS notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  channel text NOT NULL,
  to_address text NOT NULL,
  to_name text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  body text NOT NULL,
  template_key text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'queued',
  error_message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_message_templates_tenant_key
ON message_templates (tenant_id, template_key);

CREATE INDEX IF NOT EXISTS idx_notification_queue_tenant_status
ON notification_queue (tenant_id, status, created_at);

INSERT INTO message_templates (tenant_id, template_key, name, channel, subject, body)
VALUES
  ('tenant_demo', 'booking_requested', 'Booking Requested', 'email', 'Service request received', 'Hello {{customerName}}, we received your {{serviceType}} request for {{requestedDate}}.'),
  ('tenant_demo', 'invoice_ready', 'Invoice Ready', 'email', 'Your invoice is ready', 'Hello {{customerName}}, your invoice total is ${{total}}.')
ON CONFLICT (tenant_id, template_key) DO NOTHING;
