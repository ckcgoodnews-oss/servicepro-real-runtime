-- Sprint 128 PostgreSQL migration: data retention and records lifecycle.

CREATE TABLE IF NOT EXISTS retention_record_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  data_category text NOT NULL DEFAULT '',
  system_of_record text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  record_class_id uuid,
  retention_days integer NOT NULL DEFAULT 365,
  retention_trigger text NOT NULL DEFAULT 'created_at',
  disposition_action text NOT NULL DEFAULT 'delete',
  requires_approval boolean NOT NULL DEFAULT true,
  owner text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS retention_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  policy_id uuid NOT NULL,
  record_class_id uuid,
  record_id text NOT NULL,
  record_locator text NOT NULL DEFAULT '',
  trigger_at timestamptz NOT NULL,
  eligible_at timestamptz,
  status text NOT NULL DEFAULT 'scheduled',
  blocked_by_hold boolean NOT NULL DEFAULT false,
  legal_hold_id text NOT NULL DEFAULT '',
  disposition_action text NOT NULL DEFAULT 'delete',
  disposed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS retention_disposition_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL,
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

CREATE TABLE IF NOT EXISTS retention_deletion_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  schedule_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'queued',
  requested_by text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  records_processed integer NOT NULL DEFAULT 0,
  records_failed integer NOT NULL DEFAULT 0,
  error_message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retention_classes_tenant_status ON retention_record_classes (tenant_id, status, data_category);
CREATE INDEX IF NOT EXISTS idx_retention_policies_tenant_status ON retention_policies (tenant_id, status, record_class_id);
CREATE INDEX IF NOT EXISTS idx_retention_schedules_tenant_status ON retention_schedules (tenant_id, status, eligible_at);
CREATE INDEX IF NOT EXISTS idx_retention_schedules_record ON retention_schedules (record_class_id, record_id);
CREATE INDEX IF NOT EXISTS idx_retention_reviews_schedule_status ON retention_disposition_reviews (schedule_id, status);
CREATE INDEX IF NOT EXISTS idx_retention_jobs_tenant_status ON retention_deletion_jobs (tenant_id, status, requested_at DESC);
