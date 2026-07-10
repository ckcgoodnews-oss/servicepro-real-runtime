-- Sprint 31 PostgreSQL migration: GIS, route optimization, fleet, and geofencing.

CREATE TABLE IF NOT EXISTS fleet_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  vehicle_number text NOT NULL,
  vin text,
  make text,
  model text,
  model_year integer,
  license_plate text,
  status text NOT NULL DEFAULT 'active',
  assigned_technician_id uuid,
  odometer_miles numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, vehicle_number)
);

CREATE TABLE IF NOT EXISTS gps_tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  technician_id uuid,
  vehicle_id uuid,
  latitude numeric(10,7) NOT NULL,
  longitude numeric(10,7) NOT NULL,
  accuracy_meters numeric(10,2),
  speed_mph numeric(10,2),
  heading_degrees numeric(10,2),
  event_time timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'mobile',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS route_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  route_date date NOT NULL,
  technician_id uuid,
  vehicle_id uuid,
  status text NOT NULL DEFAULT 'draft',
  optimization_strategy text NOT NULL DEFAULT 'time',
  total_distance_miles numeric(12,2) NOT NULL DEFAULT 0,
  total_drive_minutes integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS route_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  route_plan_id uuid NOT NULL,
  job_id uuid,
  stop_sequence integer NOT NULL,
  address text NOT NULL,
  latitude numeric(10,7),
  longitude numeric(10,7),
  scheduled_arrival timestamptz,
  estimated_arrival timestamptz,
  estimated_drive_minutes integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS travel_time_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  origin_address text NOT NULL,
  destination_address text NOT NULL,
  origin_latitude numeric(10,7),
  origin_longitude numeric(10,7),
  destination_latitude numeric(10,7),
  destination_longitude numeric(10,7),
  distance_miles numeric(12,2),
  drive_minutes integer,
  provider text NOT NULL DEFAULT 'manual',
  calculated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS vehicle_maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  vehicle_id uuid NOT NULL,
  maintenance_type text NOT NULL,
  description text NOT NULL DEFAULT '',
  service_date date NOT NULL,
  odometer_miles numeric(12,2),
  vendor_name text,
  cost numeric(12,2) NOT NULL DEFAULT 0,
  next_due_date date,
  next_due_odometer_miles numeric(12,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fuel_purchase_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  vehicle_id uuid NOT NULL,
  purchase_date date NOT NULL,
  gallons numeric(12,3) NOT NULL DEFAULT 0,
  total_cost numeric(12,2) NOT NULL DEFAULT 0,
  odometer_miles numeric(12,2),
  vendor_name text,
  payment_method text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS geofences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  geofence_type text NOT NULL DEFAULT 'circle',
  center_latitude numeric(10,7),
  center_longitude numeric(10,7),
  radius_meters numeric(12,2),
  polygon_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS geofence_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  geofence_id uuid NOT NULL,
  technician_id uuid,
  vehicle_id uuid,
  event_type text NOT NULL,
  latitude numeric(10,7),
  longitude numeric(10,7),
  event_time timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_gps_tracking_events_tenant_time
ON gps_tracking_events (tenant_id, event_time DESC);

CREATE INDEX IF NOT EXISTS idx_route_plans_tenant_date
ON route_plans (tenant_id, route_date, status);

CREATE INDEX IF NOT EXISTS idx_route_stops_plan_sequence
ON route_stops (route_plan_id, stop_sequence);

CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_vehicle_date
ON vehicle_maintenance_records (tenant_id, vehicle_id, service_date DESC);

CREATE INDEX IF NOT EXISTS idx_geofence_events_tenant_time
ON geofence_events (tenant_id, event_time DESC);
