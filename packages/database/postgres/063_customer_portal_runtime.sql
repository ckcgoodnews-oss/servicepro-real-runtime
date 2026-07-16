-- Sprint 63 PostgreSQL migration: customer portal runtime.

CREATE TABLE IF NOT EXISTS portal_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_id uuid NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_portal_accounts_tenant_email
ON portal_accounts (tenant_id, lower(email));

CREATE TABLE IF NOT EXISTS portal_booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_id uuid NOT NULL,
  portal_account_id uuid,
  service_type text NOT NULL,
  requested_date date NOT NULL,
  requested_time_window text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  problem_description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'requested',
  converted_job_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portal_login_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  portal_account_id uuid,
  email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'success',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_accounts_tenant_customer
ON portal_accounts (tenant_id, customer_id);

CREATE INDEX IF NOT EXISTS idx_portal_booking_requests_tenant_customer
ON portal_booking_requests (tenant_id, customer_id, created_at DESC);
