-- Sprint 85 PostgreSQL migration: technician time entries and labor costing.

CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  technician_id uuid NOT NULL,
  user_id text NOT NULL DEFAULT '',
  job_id uuid,
  appointment_id uuid,
  entry_type text NOT NULL DEFAULT 'labor',
  status text NOT NULL DEFAULT 'open',
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  duration_minutes integer NOT NULL DEFAULT 0,
  hourly_rate numeric(12,2) NOT NULL DEFAULT 0,
  labor_cost numeric(12,2) NOT NULL DEFAULT 0,
  billable boolean NOT NULL DEFAULT true,
  notes text NOT NULL DEFAULT '',
  approved_by text NOT NULL DEFAULT '',
  approved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_time_entries_tenant_technician
ON time_entries (tenant_id, technician_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_time_entries_tenant_job
ON time_entries (tenant_id, job_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_time_entries_tenant_status
ON time_entries (tenant_id, status, started_at DESC);
