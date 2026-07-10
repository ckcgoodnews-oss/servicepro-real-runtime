-- Sprint 90 PostgreSQL migration: QA inspection templates and inspection instances.

CREATE TABLE IF NOT EXISTS qa_inspection_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  applies_to text NOT NULL DEFAULT 'job',
  active boolean NOT NULL DEFAULT true,
  passing_score_percent numeric(8,2) NOT NULL DEFAULT 100,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS qa_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  template_id uuid NOT NULL,
  template_code text NOT NULL,
  entity_type text NOT NULL DEFAULT 'job',
  entity_id text NOT NULL,
  job_id uuid,
  customer_id uuid,
  asset_id uuid,
  technician_id uuid,
  inspector_id text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  score_percent numeric(8,2) NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  started_at timestamptz,
  completed_at timestamptz,
  corrective_action_required boolean NOT NULL DEFAULT false,
  corrective_action_notes text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qa_templates_tenant_active
ON qa_inspection_templates (tenant_id, active, code);

CREATE INDEX IF NOT EXISTS idx_qa_inspections_tenant_entity
ON qa_inspections (tenant_id, entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_qa_inspections_tenant_job
ON qa_inspections (tenant_id, job_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_qa_inspections_tenant_status
ON qa_inspections (tenant_id, status, created_at DESC);
