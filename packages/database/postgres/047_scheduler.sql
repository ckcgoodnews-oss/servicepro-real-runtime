CREATE TABLE scheduler_calendars(
 id uuid primary key,
 tenant_id uuid,
 name text,
 timezone text
);
CREATE TABLE technician_availability(
 id uuid primary key,
 tenant_id uuid,
 technician_id uuid,
 start_time timestamptz,
 end_time timestamptz
);
CREATE TABLE route_plans(
 id uuid primary key,
 tenant_id uuid,
 route_date date,
 status text
);
CREATE TABLE sla_policies(
 id uuid primary key,
 tenant_id uuid,
 priority text,
 response_minutes integer,
 completion_minutes integer
);
CREATE TABLE workforce_capacity(
 id uuid primary key,
 tenant_id uuid,
 work_date date,
 available_hours numeric
);
