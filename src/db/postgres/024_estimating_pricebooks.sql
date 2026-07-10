CREATE TABLE IF NOT EXISTS price_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  currency_code text NOT NULL DEFAULT 'USD',
  active boolean NOT NULL DEFAULT true,
  effective_start date,
  effective_end date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS price_book_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  price_book_id uuid NOT NULL,
  item_code text NOT NULL,
  item_type text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  unit text NOT NULL DEFAULT 'each',
  unit_cost numeric(12,2) NOT NULL DEFAULT 0,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  taxable boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, price_book_id, item_code)
);

CREATE TABLE IF NOT EXISTS labor_rate_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  role_name text NOT NULL,
  hourly_cost numeric(12,2) NOT NULL DEFAULT 0,
  hourly_bill_rate numeric(12,2) NOT NULL DEFAULT 0,
  overtime_multiplier numeric(8,4) NOT NULL DEFAULT 1.5,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_assemblies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  assembly_code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  default_quantity numeric(12,2) NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, assembly_code)
);

CREATE TABLE IF NOT EXISTS service_assembly_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  assembly_id uuid NOT NULL,
  price_book_item_id uuid,
  labor_rate_id uuid,
  line_type text NOT NULL,
  name text NOT NULL,
  quantity numeric(12,2) NOT NULL DEFAULT 1,
  unit_cost numeric(12,2) NOT NULL DEFAULT 0,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS margin_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  applies_to text NOT NULL,
  minimum_margin_percent numeric(8,4) NOT NULL DEFAULT 0,
  target_margin_percent numeric(8,4) NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quote_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  template_type text NOT NULL DEFAULT 'standard',
  header_text text NOT NULL DEFAULT '',
  footer_text text NOT NULL DEFAULT '',
  terms_text text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS estimate_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  estimate_id uuid NOT NULL,
  requested_by uuid,
  approved_by uuid,
  status text NOT NULL DEFAULT 'pending',
  approval_notes text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz
);

CREATE TABLE IF NOT EXISTS change_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  job_id uuid,
  estimate_id uuid,
  change_order_number text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  requested_by uuid,
  approved_by_customer boolean NOT NULL DEFAULT false,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, change_order_number)
);

CREATE TABLE IF NOT EXISTS estimate_revision_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  estimate_id uuid NOT NULL,
  revision_number integer NOT NULL,
  changed_by uuid,
  change_reason text NOT NULL DEFAULT '',
  snapshot_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, estimate_id, revision_number)
);
