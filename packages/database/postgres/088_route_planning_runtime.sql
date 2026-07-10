-- Sprint 88 PostgreSQL migration: route planning and route stops.

CREATE TABLE IF NOT EXISTS route_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  route_date date NOT NULL,
  technician_id uuid NOT NULL,
  territory_id uuid,
  status text NOT NULL DEFAULT 'draft',
  start_location_name text NOT NULL DEFAULT '',
  start_latitude numeric(10,7),
  start_longitude numeric(10,7),
  end_location_name text NOT NULL DEFAULT '',
  end_latitude numeric(10,7),
  end_longitude numeric(10,7),
  total_distance_miles numeric(12,2) NOT NULL DEFAULT 0,
  total_drive_minutes integer NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS route_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  route_plan_id uuid NOT NULL,
  job_id uuid,
  customer_id uuid,
  appointment_id uuid,
  stop_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'planned',
  address1 text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  latitude numeric(10,7),
  longitude numeric(10,7),
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  service_minutes integer NOT NULL DEFAULT 60,
  drive_minutes_from_previous integer NOT NULL DEFAULT 0,
  distance_miles_from_previous numeric(12,2) NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_route_plans_tenant_date_tech
ON route_plans (tenant_id, route_date, technician_id);

CREATE INDEX IF NOT EXISTS idx_route_plans_tenant_status
ON route_plans (tenant_id, status, route_date);

CREATE INDEX IF NOT EXISTS idx_route_stops_tenant_plan_order
ON route_stops (tenant_id, route_plan_id, stop_order);

CREATE INDEX IF NOT EXISTS idx_route_stops_tenant_job
ON route_stops (tenant_id, job_id);
