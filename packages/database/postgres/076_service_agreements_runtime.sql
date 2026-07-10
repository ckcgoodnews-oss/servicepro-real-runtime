-- Sprint 76 PostgreSQL migration: service agreements and recurring visits.

CREATE TABLE IF NOT EXISTS service_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_id uuid NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  frequency text NOT NULL DEFAULT 'annual',
  term_months integer NOT NULL DEFAULT 12,
  start_date date NOT NULL,
  end_date date NOT NULL,
  renewal_date date NOT NULL,
  visit_count integer NOT NULL DEFAULT 1,
  price numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agreement_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  agreement_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  job_id uuid,
  scheduled_date date NOT NULL,
  completed_date date,
  status text NOT NULL DEFAULT 'scheduled',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_agreements_tenant_customer
ON service_agreements (tenant_id, customer_id);

CREATE INDEX IF NOT EXISTS idx_service_agreements_tenant_renewal
ON service_agreements (tenant_id, renewal_date, status);

CREATE INDEX IF NOT EXISTS idx_agreement_visits_tenant_agreement
ON agreement_visits (tenant_id, agreement_id, scheduled_date);
