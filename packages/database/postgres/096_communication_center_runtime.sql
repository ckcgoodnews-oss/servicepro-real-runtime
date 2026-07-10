-- Sprint 96 PostgreSQL migration: unified communication center.

CREATE TABLE IF NOT EXISTS communication_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  subject text NOT NULL,
  channel text NOT NULL DEFAULT 'email',
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  customer_id uuid,
  job_id uuid,
  invoice_id uuid,
  estimate_id uuid,
  assigned_to text NOT NULL DEFAULT '',
  last_message_at timestamptz,
  unread_count integer NOT NULL DEFAULT 0,
  needs_response boolean NOT NULL DEFAULT false,
  response_due_at timestamptz,
  participants jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS communication_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  thread_id uuid NOT NULL,
  channel text NOT NULL DEFAULT 'email',
  direction text NOT NULL DEFAULT 'outbound',
  status text NOT NULL DEFAULT 'queued',
  from_name text NOT NULL DEFAULT '',
  from_address text NOT NULL DEFAULT '',
  recipients_to jsonb NOT NULL DEFAULT '[]'::jsonb,
  recipients_cc jsonb NOT NULL DEFAULT '[]'::jsonb,
  recipients_bcc jsonb NOT NULL DEFAULT '[]'::jsonb,
  subject text NOT NULL DEFAULT '',
  body text NOT NULL,
  external_message_id text NOT NULL DEFAULT '',
  sent_at timestamptz,
  received_at timestamptz,
  read_at timestamptz,
  failed_reason text NOT NULL DEFAULT '',
  attachment_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_communication_threads_tenant_customer
ON communication_threads (tenant_id, customer_id, COALESCE(last_message_at, created_at) DESC);

CREATE INDEX IF NOT EXISTS idx_communication_threads_tenant_job
ON communication_threads (tenant_id, job_id, COALESCE(last_message_at, created_at) DESC);

CREATE INDEX IF NOT EXISTS idx_communication_threads_tenant_status
ON communication_threads (tenant_id, status, COALESCE(last_message_at, created_at) DESC);

CREATE INDEX IF NOT EXISTS idx_communication_threads_tenant_assigned
ON communication_threads (tenant_id, assigned_to, COALESCE(last_message_at, created_at) DESC);

CREATE INDEX IF NOT EXISTS idx_communication_messages_tenant_thread
ON communication_messages (tenant_id, thread_id, COALESCE(received_at, sent_at, created_at));
