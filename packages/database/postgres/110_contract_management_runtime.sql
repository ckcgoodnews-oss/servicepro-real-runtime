-- Sprint 110 PostgreSQL migration: enterprise contract management runtime.

CREATE TABLE IF NOT EXISTS contract_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  counterparty_name text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  effective_date date,
  start_date date,
  end_date date,
  renewal_type text NOT NULL DEFAULT 'manual',
  notice_days integer NOT NULL DEFAULT 30,
  total_contract_value_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  document_url text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contract_order_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  start_date date,
  end_date date,
  billing_interval text NOT NULL DEFAULT 'monthly',
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  signed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contract_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL,
  term_type text NOT NULL DEFAULT 'custom',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  effective_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contract_amendments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  summary text NOT NULL DEFAULT '',
  effective_date date,
  signed_at timestamptz,
  document_url text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contract_obligations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  due_date date,
  status text NOT NULL DEFAULT 'open',
  fulfilled_at timestamptz,
  evidence_url text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contract_agreements_tenant_status ON contract_agreements (tenant_id, status, end_date);
CREATE INDEX IF NOT EXISTS idx_contract_order_forms_agreement ON contract_order_forms (agreement_id, status, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_contract_terms_agreement ON contract_terms (agreement_id, term_type);
CREATE INDEX IF NOT EXISTS idx_contract_amendments_agreement ON contract_amendments (agreement_id, status, effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_contract_obligations_agreement ON contract_obligations (agreement_id, status, due_date);
