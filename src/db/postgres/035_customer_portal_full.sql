-- Sprint 35 PostgreSQL migration: customer portal, booking, payments, tracking, memberships, documents, and chat.

CREATE TABLE IF NOT EXISTS customer_portal_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  email text NOT NULL,
  password_hash text,
  magic_link_enabled boolean NOT NULL DEFAULT true,
  enabled boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

CREATE TABLE IF NOT EXISTS customer_portal_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  portal_account_id uuid NOT NULL,
  session_token_hash text NOT NULL,
  ip_address text,
  user_agent text,
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);

CREATE TABLE IF NOT EXISTS online_booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  customer_id uuid,
  portal_account_id uuid,
  service_type text NOT NULL,
  requested_date date,
  requested_start_time time,
  requested_end_time time,
  address text NOT NULL DEFAULT '',
  problem_description text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'requested',
  converted_job_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_payment_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  invoice_id uuid,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  provider text NOT NULL DEFAULT 'manual',
  provider_session_id text,
  status text NOT NULL DEFAULT 'created',
  checkout_url text,
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS live_tracking_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  job_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  technician_id uuid,
  tracking_token_hash text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  last_latitude numeric(10,7),
  last_longitude numeric(10,7),
  last_eta_minutes integer,
  last_updated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_membership_portal_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  membership_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  renewal_date date,
  next_service_due date,
  portal_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_document_vault_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  uploaded_by uuid,
  document_type text NOT NULL,
  title text NOT NULL,
  storage_key text NOT NULL,
  mime_type text NOT NULL,
  file_size_bytes bigint NOT NULL DEFAULT 0,
  portal_visible boolean NOT NULL DEFAULT true,
  customer_uploaded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  job_id uuid,
  subject text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

CREATE TABLE IF NOT EXISTS customer_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  thread_id uuid NOT NULL,
  sender_type text NOT NULL,
  sender_id uuid,
  message_body text NOT NULL,
  attachment_file_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portal_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  email_enabled boolean NOT NULL DEFAULT true,
  sms_enabled boolean NOT NULL DEFAULT true,
  appointment_updates boolean NOT NULL DEFAULT true,
  billing_updates boolean NOT NULL DEFAULT true,
  marketing_updates boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_portal_accounts_tenant_customer
ON customer_portal_accounts (tenant_id, customer_id);

CREATE INDEX IF NOT EXISTS idx_online_booking_requests_tenant_status
ON online_booking_requests (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_sessions_tenant_status
ON customer_payment_sessions (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_live_tracking_sessions_job
ON live_tracking_sessions (tenant_id, job_id, status);

CREATE INDEX IF NOT EXISTS idx_customer_documents_customer
ON customer_document_vault_items (tenant_id, customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_chat_threads_customer
ON customer_chat_threads (tenant_id, customer_id, status);
