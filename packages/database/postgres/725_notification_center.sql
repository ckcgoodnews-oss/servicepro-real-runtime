ALTER TABLE notification_queue ADD COLUMN IF NOT EXISTS read_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_notification_queue_inbox ON notification_queue (tenant_id, lower(to_address), read_at, created_at DESC);

INSERT INTO notification_queue (tenant_id,channel,to_address,to_name,subject,body,status,sent_at)
SELECT 'tenant_demo','push','owner@example.com','Business Owner','Tomorrow’s first call is assigned','Chris is scheduled for Maria Johnson’s kitchen sink service at 10:00 AM.','sent',now()
WHERE NOT EXISTS (SELECT 1 FROM notification_queue WHERE tenant_id='tenant_demo' AND subject='Tomorrow’s first call is assigned');
