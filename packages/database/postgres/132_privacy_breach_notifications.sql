-- Sprint 132 PostgreSQL migration: privacy incident and breach notifications.

CREATE TABLE IF NOT EXISTS privacy_breach_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  incident_number text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'reported',
  severity text NOT NULL DEFAULT 'medium',
  reported_by text NOT NULL DEFAULT '',
  reported_at timestamptz NOT NULL,
  discovered_at timestamptz NOT NULL,
  contained_at timestamptz,
  resolved_at timestamptz,
  affected_subjects integer NOT NULL DEFAULT 0,
  affected_data_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  systems jsonb NOT NULL DEFAULT '[]'::jsonb,
  owner text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_breach_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  decision text NOT NULL DEFAULT 'escalate_to_counsel',
  assessor text NOT NULL DEFAULT '',
  assessed_at timestamptz,
  risk_of_harm text NOT NULL DEFAULT 'unknown',
  encrypted_data boolean NOT NULL DEFAULT false,
  containment_effective boolean NOT NULL DEFAULT false,
  summary text NOT NULL DEFAULT '',
  legal_basis text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_breach_obligations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  notice_type text NOT NULL,
  jurisdiction text NOT NULL DEFAULT '',
  recipient text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  due_at timestamptz,
  completed_at timestamptz,
  waived_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_breach_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL,
  obligation_id uuid,
  tenant_id text NOT NULL DEFAULT '',
  notice_type text NOT NULL,
  recipient text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  approved_by text NOT NULL DEFAULT '',
  approved_at timestamptz,
  sent_at timestamptz,
  failure_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS privacy_breach_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  evidence_type text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  file_url text NOT NULL DEFAULT '',
  collected_by text NOT NULL DEFAULT '',
  collected_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_privacy_breach_incidents_tenant_status ON privacy_breach_incidents (tenant_id, status, severity, reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_privacy_breach_assessments_incident_status ON privacy_breach_assessments (incident_id, status, decision);
CREATE INDEX IF NOT EXISTS idx_privacy_breach_obligations_incident_status ON privacy_breach_obligations (incident_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_privacy_breach_notices_incident_status ON privacy_breach_notices (incident_id, status, notice_type);
CREATE INDEX IF NOT EXISTS idx_privacy_breach_evidence_incident ON privacy_breach_evidence (incident_id, evidence_type);
