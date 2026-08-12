BEGIN;

CREATE TABLE IF NOT EXISTS subscriber_stripe_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL UNIQUE,
  stripe_account_id text NOT NULL UNIQUE, account_type text NOT NULL DEFAULT 'express',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','onboarding','restricted','active','restricted_soon','disabled','disconnected')),
  charges_enabled boolean NOT NULL DEFAULT false, payouts_enabled boolean NOT NULL DEFAULT false,
  details_submitted boolean NOT NULL DEFAULT false, country text NOT NULL DEFAULT '',
  default_currency text NOT NULL DEFAULT 'usd', business_type text NOT NULL DEFAULT '',
  disconnected_at timestamptz, metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriber_stripe_accounts_tenant ON subscriber_stripe_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriber_stripe_accounts_account ON subscriber_stripe_accounts(stripe_account_id);

CREATE TABLE IF NOT EXISTS subscriber_payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL UNIQUE,
  accept_customer_payments boolean NOT NULL DEFAULT false, default_currency text NOT NULL DEFAULT 'usd',
  accepted_methods jsonb NOT NULL DEFAULT '["card"]'::jsonb, deposits_enabled boolean NOT NULL DEFAULT false,
  progress_payments_enabled boolean NOT NULL DEFAULT false, partial_payments_enabled boolean NOT NULL DEFAULT true,
  saved_payment_methods boolean NOT NULL DEFAULT false, tips_enabled boolean NOT NULL DEFAULT false,
  convenience_fee_enabled boolean NOT NULL DEFAULT false, convenience_fee_percent numeric(5,4) NOT NULL DEFAULT 0,
  automatic_receipts boolean NOT NULL DEFAULT true, payment_reminders boolean NOT NULL DEFAULT false,
  refund_permission text NOT NULL DEFAULT 'owner_only' CHECK (refund_permission IN ('owner_only','admin','billing_role')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (convenience_fee_percent >= 0 AND convenience_fee_percent <= 1)
);

CREATE TABLE IF NOT EXISTS customer_payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, invoice_id uuid, payment_id uuid,
  customer_id uuid, event_type text NOT NULL CHECK (event_type IN ('payment_created','payment_pending','payment_succeeded','payment_failed','payment_applied','deposit_applied','partial_payment_applied','refund_requested','refund_succeeded','partial_refund','dispute_opened','dispute_won','dispute_lost','chargeback','credit','adjustment')),
  domain text NOT NULL DEFAULT 'customer_invoice' CHECK (domain IN ('customer_invoice','customer_membership','platform_subscription')),
  amount_cents integer NOT NULL CHECK (amount_cents >= 0), currency text NOT NULL DEFAULT 'usd',
  balance_before_cents integer, balance_after_cents integer, stripe_payment_intent_id text NOT NULL DEFAULT '',
  stripe_charge_id text NOT NULL DEFAULT '', stripe_refund_id text NOT NULL DEFAULT '',
  idempotency_key text NOT NULL UNIQUE, metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cpe_tenant_invoice ON customer_payment_events(tenant_id,invoice_id);
CREATE INDEX IF NOT EXISTS idx_cpe_tenant_type ON customer_payment_events(tenant_id,event_type,created_at DESC);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_charge_id text NOT NULL DEFAULT '';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_connected_account_id text NOT NULL DEFAULT '';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS idempotency_key text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS amount_cents integer;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_type text NOT NULL DEFAULT 'full';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS failed_at timestamptz;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS failure_reason text NOT NULL DEFAULT '';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_amount_cents integer NOT NULL DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_at timestamptz;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_refund_id text NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency ON payments(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_connected_intent ON payments(stripe_connected_account_id,stripe_payment_intent_id);

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_terms_days integer NOT NULL DEFAULT 30;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS due_date date;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deposit_required_cents integer NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deposit_paid_cents integer NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'usd';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sent_at timestamptz;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_link_token text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_link_expires_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_number ON invoices(tenant_id,invoice_number) WHERE invoice_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_payment_link ON invoices(payment_link_token) WHERE payment_link_token IS NOT NULL;

COMMIT;
