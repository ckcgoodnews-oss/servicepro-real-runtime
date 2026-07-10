-- Sprint 61 PostgreSQL migration: scheduling and dispatch runtime.

CREATE TABLE IF NOT EXISTS technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  job_id uuid NOT NULL,
  customer_id uuid,
  technician_id uuid NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dispatch_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  job_id uuid NOT NULL,
  technician_id uuid NOT NULL,
  appointment_id uuid,
  status text NOT NULL DEFAULT 'assigned',
  assigned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schedule_conflict_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  technician_id uuid,
  attempted_start timestamptz,
  attempted_end timestamptz,
  conflict_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_technicians_tenant_active
ON technicians (tenant_id, active, name);

CREATE INDEX IF NOT EXISTS idx_appointments_tenant_technician_time
ON appointments (tenant_id, technician_id, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_dispatch_assignments_tenant_job
ON dispatch_assignments (tenant_id, job_id, assigned_at DESC);

INSERT INTO technicians (tenant_id, name, email, phone, skills)
SELECT 'tenant_demo', 'Chris Technician', 'tech@example.com', '555-0202', '["drain","water_heater"]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM technicians WHERE tenant_id = 'tenant_demo' AND email = 'tech@example.com'
);
