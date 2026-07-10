-- Sprint 114 PostgreSQL migration: security incident response runtime.

CREATE TABLE IF NOT EXISTS security_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number text NOT NULL UNIQUE,
  tenant_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  severity text NOT NULL DEFAULT 'medium',
  incident_type text NOT NULL DEFAULT 'other',
  detected_at timestamptz NOT NULL,
  reported_by text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  affected_systems jsonb NOT NULL DEFAULT '[]'::jsonb,
  affected_data_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  contained_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_containment_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  owner text NOT NULL DEFAULT '',
  due_at timestamptz,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_evidence_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL,
  title text NOT NULL,
  evidence_type text NOT NULL DEFAULT 'other',
  source text NOT NULL DEFAULT '',
  collected_by text NOT NULL DEFAULT '',
  collected_at timestamptz NOT NULL,
  hash text NOT NULL DEFAULT '',
  uri text NOT NULL DEFAULT '',
  chain_of_custody jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_incident_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL,
  recipient text NOT NULL,
  channel text NOT NULL DEFAULT 'email',
  status text NOT NULL DEFAULT 'pending',
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz,
  failure_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_postmortems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  summary text NOT NULL DEFAULT '',
  root_cause text NOT NULL DEFAULT '',
  impact text NOT NULL DEFAULT '',
  timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  corrective_actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  owner text NOT NULL DEFAULT '',
  approved_by text NOT NULL DEFAULT '',
  approved_at timestamptz,
  published_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_incidents_tenant_status ON security_incidents (tenant_id, status, severity, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_tasks_incident_status ON security_containment_tasks (incident_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_security_evidence_incident ON security_evidence_records (incident_id, collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_notifications_incident_status ON security_incident_notifications (incident_id, status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_security_postmortems_incident_status ON security_postmortems (incident_id, status);
