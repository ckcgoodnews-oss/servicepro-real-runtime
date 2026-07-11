-- Sprint 158: cross-border privacy data transfer governance.
CREATE TABLE IF NOT EXISTS privacy_data_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, code text NOT NULL,
  name text NOT NULL, description text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'draft',
  source_country text NOT NULL, destination_country text NOT NULL, exporter text NOT NULL DEFAULT '',
  importer text NOT NULL DEFAULT '', processor text NOT NULL DEFAULT '', data_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  subject_categories jsonb NOT NULL DEFAULT '[]'::jsonb, purpose text NOT NULL DEFAULT '', mechanism text NOT NULL DEFAULT 'other',
  risk_level text NOT NULL DEFAULT 'medium', owner text NOT NULL DEFAULT '', approved_at timestamptz,
  activated_at timestamptz, next_review_at timestamptz, terminated_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS privacy_transfer_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, transfer_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft', risk_level text NOT NULL DEFAULT 'medium', assessor text NOT NULL DEFAULT '',
  local_law_summary text NOT NULL DEFAULT '', government_access_risk text NOT NULL DEFAULT '',
  supplementary_measures jsonb NOT NULL DEFAULT '[]'::jsonb, conclusion text NOT NULL DEFAULT '',
  submitted_at timestamptz, reviewed_by text NOT NULL DEFAULT '', reviewed_at timestamptz, expires_at timestamptz,
  rejection_reason text NOT NULL DEFAULT '', metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS privacy_transfer_safeguards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, transfer_id uuid NOT NULL,
  name text NOT NULL, safeguard_type text NOT NULL DEFAULT 'contractual', status text NOT NULL DEFAULT 'draft',
  document_url text NOT NULL DEFAULT '', version text NOT NULL DEFAULT '1.0', effective_at timestamptz,
  expires_at timestamptz, owner text NOT NULL DEFAULT '', metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS privacy_transfer_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, transfer_id uuid NOT NULL,
  assessment_id uuid, approver text NOT NULL, role text NOT NULL DEFAULT 'privacy', status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL, decided_at timestamptz, comments text NOT NULL DEFAULT '', expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_privacy_transfers_tenant_status ON privacy_data_transfers (tenant_id, status, risk_level);
CREATE INDEX IF NOT EXISTS idx_privacy_transfer_assessments_transfer ON privacy_transfer_assessments (transfer_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_privacy_transfer_safeguards_transfer ON privacy_transfer_safeguards (transfer_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_privacy_transfer_approvals_transfer ON privacy_transfer_approvals (transfer_id, status, expires_at);
