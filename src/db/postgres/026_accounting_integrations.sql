-- Sprint 26 PostgreSQL migration: accounting integrations, GL mapping, reconciliation, and payroll export.

CREATE TABLE IF NOT EXISTS accounting_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  provider text NOT NULL,
  display_name text NOT NULL,
  external_realm_id text,
  status text NOT NULL DEFAULT 'disconnected',
  access_token_ciphertext text,
  refresh_token_ciphertext text,
  token_expires_at timestamptz,
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, provider, external_realm_id)
);

CREATE TABLE IF NOT EXISTS general_ledger_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  account_code text NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL,
  provider_account_id text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, account_code)
);

CREATE TABLE IF NOT EXISTS gl_account_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  mapping_key text NOT NULL,
  source_entity_type text NOT NULL,
  source_category text NOT NULL DEFAULT '',
  gl_account_id uuid NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, mapping_key)
);

CREATE TABLE IF NOT EXISTS tax_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  rate numeric(8,6) NOT NULL DEFAULT 0,
  provider_tax_code_id text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS accounting_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  connection_id uuid,
  sync_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  started_at timestamptz,
  finished_at timestamptz,
  records_processed integer NOT NULL DEFAULT 0,
  records_failed integer NOT NULL DEFAULT 0,
  error_message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL DEFAULT 'checking',
  external_account_id text,
  last_four text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  bank_account_id uuid NOT NULL,
  transaction_date date NOT NULL,
  description text NOT NULL DEFAULT '',
  amount numeric(12,2) NOT NULL DEFAULT 0,
  external_transaction_id text,
  matched_entity_type text,
  matched_entity_id uuid,
  reconciliation_status text NOT NULL DEFAULT 'unmatched',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payroll_export_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  batch_name text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  exported_at timestamptz,
  export_format text NOT NULL DEFAULT 'csv',
  storage_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payroll_export_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  batch_id uuid NOT NULL,
  technician_id uuid NOT NULL,
  regular_hours numeric(12,2) NOT NULL DEFAULT 0,
  overtime_hours numeric(12,2) NOT NULL DEFAULT 0,
  gross_pay numeric(12,2) NOT NULL DEFAULT 0,
  reimbursement_amount numeric(12,2) NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS financial_report_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  report_type text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  report_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_by uuid,
  generated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accounting_connections_tenant
ON accounting_connections (tenant_id, provider, status);

CREATE INDEX IF NOT EXISTS idx_accounting_sync_runs_tenant
ON accounting_sync_runs (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bank_transactions_tenant_status
ON bank_transactions (tenant_id, reconciliation_status, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_payroll_export_batches_tenant_period
ON payroll_export_batches (tenant_id, period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_financial_report_snapshots_tenant_period
ON financial_report_snapshots (tenant_id, report_type, period_start, period_end);
