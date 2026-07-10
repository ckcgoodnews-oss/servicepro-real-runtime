-- Sprint 81 PostgreSQL migration: mobile checklist templates and job checklist instances.

CREATE TABLE IF NOT EXISTS checklist_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  applies_to text NOT NULL DEFAULT 'job',
  active boolean NOT NULL DEFAULT true,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS job_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  template_id uuid NOT NULL,
  template_code text NOT NULL,
  job_id uuid NOT NULL,
  technician_id uuid,
  status text NOT NULL DEFAULT 'open',
  started_at timestamptz,
  completed_at timestamptz,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checklist_templates_tenant_active
ON checklist_templates (tenant_id, active, code);

CREATE INDEX IF NOT EXISTS idx_job_checklists_tenant_job
ON job_checklists (tenant_id, job_id, status);

CREATE INDEX IF NOT EXISTS idx_job_checklists_tenant_technician
ON job_checklists (tenant_id, technician_id, status);
