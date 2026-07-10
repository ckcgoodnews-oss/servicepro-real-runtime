-- Sprint 146 PostgreSQL migration: go-live and hypercare.

CREATE TABLE IF NOT EXISTS go_live_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'launch',
  status text NOT NULL DEFAULT 'pending',
  severity text NOT NULL DEFAULT 'medium',
  owner text NOT NULL DEFAULT '',
  due_at timestamptz,
  completed_at timestamptz,
  evidence_url text NOT NULL DEFAULT '',
  waiver_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS go_live_cutover_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  environment text NOT NULL DEFAULT 'production',
  release_version text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  scheduled_start_at timestamptz,
  scheduled_end_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  approved_by text NOT NULL DEFAULT '',
  approved_at timestamptz,
  rollback_plan_url text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS go_live_cutover_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT '',
  cutover_plan_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  sequence integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  owner text NOT NULL DEFAULT '',
  started_at timestamptz,
  completed_at timestamptz,
  failure_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS go_live_dns_cutovers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  cutover_plan_id uuid,
  domain text NOT NULL,
  record_type text NOT NULL DEFAULT 'CNAME',
  previous_value text NOT NULL DEFAULT '',
  target_value text NOT NULL DEFAULT '',
  ttl_seconds integer NOT NULL DEFAULT 300,
  status text NOT NULL DEFAULT 'planned',
  validated_at timestamptz,
  propagation_started_at timestamptz,
  completed_at timestamptz,
  failure_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS go_live_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  cutover_plan_id uuid,
  audience text NOT NULL,
  channel text NOT NULL DEFAULT 'email',
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  approved_by text NOT NULL DEFAULT '',
  approved_at timestamptz,
  sent_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS go_live_rollback_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  cutover_plan_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'not_required',
  reason text NOT NULL DEFAULT '',
  decided_by text NOT NULL DEFAULT '',
  decided_at timestamptz,
  executed_at timestamptz,
  impact_summary text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hypercare_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  severity text NOT NULL DEFAULT 'medium',
  owner text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT '',
  opened_at timestamptz NOT NULL,
  resolved_at timestamptz,
  closed_at timestamptz,
  workaround text NOT NULL DEFAULT '',
  resolution text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hypercare_daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  report_date text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  summary text NOT NULL DEFAULT '',
  open_issue_count integer NOT NULL DEFAULT 0,
  critical_issue_count integer NOT NULL DEFAULT 0,
  resolved_issue_count integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  published_by text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_go_live_checklist_tenant_status ON go_live_checklist (tenant_id, status, severity);
CREATE INDEX IF NOT EXISTS idx_go_live_cutover_tenant_status ON go_live_cutover_plans (tenant_id, status, scheduled_start_at);
CREATE INDEX IF NOT EXISTS idx_go_live_steps_plan_sequence ON go_live_cutover_steps (cutover_plan_id, sequence, status);
CREATE INDEX IF NOT EXISTS idx_go_live_dns_tenant_status ON go_live_dns_cutovers (tenant_id, status, domain);
CREATE INDEX IF NOT EXISTS idx_go_live_comms_tenant_status ON go_live_communications (tenant_id, status, audience);
CREATE INDEX IF NOT EXISTS idx_go_live_rollback_plan_status ON go_live_rollback_decisions (cutover_plan_id, status);
CREATE INDEX IF NOT EXISTS idx_hypercare_issues_tenant_status ON hypercare_issues (tenant_id, status, severity, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_hypercare_reports_tenant_date ON hypercare_daily_reports (tenant_id, report_date, status);
