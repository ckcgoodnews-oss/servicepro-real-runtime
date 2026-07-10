-- Sprint 152: privacy case orchestration.
CREATE TABLE IF NOT EXISTS privacy_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, dsar_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'open', jurisdiction text NOT NULL DEFAULT 'DEFAULT', owner text NOT NULL DEFAULT '',
  received_at timestamptz NOT NULL, due_at timestamptz NOT NULL, extension_days integer NOT NULL DEFAULT 0,
  extension_reason text NOT NULL DEFAULT '', verification_status text NOT NULL DEFAULT 'pending',
  verification_evidence jsonb NOT NULL DEFAULT '{}'::jsonb, verified_at timestamptz, closed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS privacy_case_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, case_id uuid NOT NULL REFERENCES privacy_cases(id) ON DELETE CASCADE,
  name text NOT NULL, status text NOT NULL DEFAULT 'pending', assignee text NOT NULL DEFAULT '', due_at timestamptz,
  completed_at timestamptz, evidence jsonb NOT NULL DEFAULT '{}'::jsonb, metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS privacy_case_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, case_id uuid NOT NULL REFERENCES privacy_cases(id) ON DELETE CASCADE,
  type text NOT NULL, channel text NOT NULL DEFAULT 'email', recipient text NOT NULL DEFAULT '', subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '', sent_at timestamptz NOT NULL, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_privacy_cases_tenant_due ON privacy_cases (tenant_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_privacy_case_tasks_case_status ON privacy_case_tasks (case_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_privacy_case_comms_case_sent ON privacy_case_communications (case_id, sent_at DESC);
