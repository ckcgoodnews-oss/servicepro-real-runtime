CREATE TABLE IF NOT EXISTS membership_plans(
 id uuid primary key,
 tenant_id uuid not null,
 name text not null,
 monthly_price numeric(12,2) not null,
 annual_price numeric(12,2),
 visit_count integer default 1
);

CREATE TABLE IF NOT EXISTS customer_memberships(
 id uuid primary key,
 tenant_id uuid not null,
 customer_id uuid not null,
 membership_plan_id uuid not null,
 status text not null default 'active'
);

CREATE TABLE IF NOT EXISTS customer_equipment(
 id uuid primary key,
 tenant_id uuid not null,
 customer_id uuid not null,
 manufacturer text,
 model text,
 serial_number text,
 install_date date
);

CREATE TABLE IF NOT EXISTS equipment_service_history(
 id uuid primary key,
 equipment_id uuid not null,
 job_id uuid,
 service_date timestamptz default now(),
 notes text
);
