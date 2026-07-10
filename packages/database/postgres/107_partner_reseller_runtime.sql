-- Sprint 107 PostgreSQL migration: partner and reseller runtime.

CREATE TABLE IF NOT EXISTS partner_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  partner_type text NOT NULL DEFAULT 'referral',
  status text NOT NULL DEFAULT 'active',
  primary_contact_name text NOT NULL DEFAULT '',
  primary_contact_email text NOT NULL DEFAULT '',
  company_url text NOT NULL DEFAULT '',
  tax_id_ref text NOT NULL DEFAULT '',
  payout_method_ref text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reseller_tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  tenant_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  assigned_at timestamptz NOT NULL,
  ended_at timestamptz,
  account_manager text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS partner_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  prospect_name text NOT NULL,
  prospect_email text NOT NULL DEFAULT '',
  prospect_company text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'submitted',
  submitted_at timestamptz NOT NULL,
  accepted_at timestamptz,
  closed_at timestamptz,
  won_tenant_id text NOT NULL DEFAULT '',
  estimated_value_cents integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  name text NOT NULL,
  commission_type text NOT NULL DEFAULT 'percentage',
  percentage_bps integer NOT NULL DEFAULT 0,
  fixed_amount_cents integer NOT NULL DEFAULT 0,
  applies_to text NOT NULL DEFAULT 'subscription_revenue',
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commission_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  referral_id uuid,
  commission_rule_id uuid,
  source_type text NOT NULL DEFAULT '',
  source_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  earned_at timestamptz NOT NULL,
  approved_by text NOT NULL DEFAULT '',
  approved_at timestamptz,
  paid_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payout_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  currency text NOT NULL DEFAULT 'USD',
  total_amount_cents integer NOT NULL DEFAULT 0,
  commission_ledger_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by text NOT NULL DEFAULT '',
  approved_by text NOT NULL DEFAULT '',
  approved_at timestamptz,
  paid_at timestamptz,
  failure_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_accounts_status_type ON partner_accounts (status, partner_type, name);
CREATE INDEX IF NOT EXISTS idx_reseller_tenants_partner ON reseller_tenants (partner_id, status);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_partner_status ON partner_referrals (partner_id, status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_partner_status ON commission_ledger (partner_id, status, earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_payout_batches_partner_status ON payout_batches (partner_id, status, created_at DESC);
