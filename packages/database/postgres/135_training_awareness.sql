-- Sprint 135 PostgreSQL migration: training and awareness runtime.

CREATE TABLE IF NOT EXISTS training_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  course_type text NOT NULL DEFAULT 'other',
  owner text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL DEFAULT 30,
  content_url text NOT NULL DEFAULT '',
  passing_score numeric(5,2) NOT NULL DEFAULT 80,
  renewal_days integer NOT NULL DEFAULT 365,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  course_id uuid NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  target_roles jsonb NOT NULL DEFAULT '[]'::jsonb,
  target_departments jsonb NOT NULL DEFAULT '[]'::jsonb,
  owner text NOT NULL DEFAULT '',
  starts_at timestamptz,
  due_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  campaign_id uuid,
  course_id uuid NOT NULL,
  subject_id text NOT NULL,
  subject_name text NOT NULL DEFAULT '',
  subject_email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'assigned',
  assigned_at timestamptz NOT NULL,
  started_at timestamptz,
  due_at timestamptz,
  completed_at timestamptz,
  score numeric(5,2),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  evidence_type text NOT NULL DEFAULT 'other',
  evidence_url text NOT NULL DEFAULT '',
  score numeric(5,2),
  passed boolean NOT NULL DEFAULT false,
  recorded_by text NOT NULL DEFAULT '',
  recorded_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  recipient_email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'queued',
  queued_at timestamptz NOT NULL,
  sent_at timestamptz,
  failed_at timestamptz,
  failure_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  requester_id text NOT NULL,
  requester_name text NOT NULL DEFAULT '',
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'requested',
  decided_by text NOT NULL DEFAULT '',
  decided_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_training_courses_tenant_status ON training_courses (tenant_id, status, course_type);
CREATE INDEX IF NOT EXISTS idx_training_campaigns_tenant_status ON training_campaigns (tenant_id, status, starts_at);
CREATE INDEX IF NOT EXISTS idx_training_assignments_tenant_status ON training_assignments (tenant_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_training_assignments_subject ON training_assignments (tenant_id, subject_id, status);
CREATE INDEX IF NOT EXISTS idx_training_evidence_assignment ON training_evidence (assignment_id, evidence_type);
CREATE INDEX IF NOT EXISTS idx_training_reminders_assignment_status ON training_reminders (assignment_id, status);
CREATE INDEX IF NOT EXISTS idx_training_exceptions_assignment_status ON training_exceptions (assignment_id, status);
