-- Sprint 124 PostgreSQL migration: security questionnaire automation.

CREATE TABLE IF NOT EXISTS security_questionnaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  questionnaire_number text NOT NULL,
  customer_name text NOT NULL,
  customer_contact_email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'received',
  owner text NOT NULL DEFAULT '',
  received_at timestamptz NOT NULL,
  due_at timestamptz,
  approved_at timestamptz,
  sent_at timestamptz,
  source_file_url text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_questionnaire_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  section text NOT NULL DEFAULT '',
  question_key text NOT NULL DEFAULT '',
  question_text text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  assigned_to text NOT NULL DEFAULT '',
  answer_text text NOT NULL DEFAULT '',
  source_answer_id uuid,
  confidence numeric(5,2) NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_answer_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  question_pattern text NOT NULL,
  answer_text text NOT NULL,
  status text NOT NULL DEFAULT 'approved',
  owner text NOT NULL DEFAULT '',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_reviewed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_questionnaire_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  reviewer_id text NOT NULL,
  reviewer_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL,
  responded_at timestamptz,
  comments text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_questionnaire_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id uuid NOT NULL,
  tenant_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'queued',
  format text NOT NULL DEFAULT 'xlsx',
  requested_by text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  output_url text NOT NULL DEFAULT '',
  error_message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_questionnaires_tenant_status ON security_questionnaires (tenant_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_security_questions_questionnaire_status ON security_questionnaire_questions (questionnaire_id, status, section);
CREATE INDEX IF NOT EXISTS idx_security_answer_library_tenant_status ON security_answer_library (tenant_id, status, code);
CREATE INDEX IF NOT EXISTS idx_security_reviews_questionnaire_status ON security_questionnaire_reviews (questionnaire_id, status);
CREATE INDEX IF NOT EXISTS idx_security_exports_questionnaire_status ON security_questionnaire_exports (questionnaire_id, status);
