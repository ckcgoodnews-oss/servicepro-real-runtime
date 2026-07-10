CREATE TABLE enterprise_locations(
 id uuid primary key,
 tenant_id uuid not null,
 name text not null,
 code text not null,
 timezone text,
 active boolean default true
);

CREATE TABLE ai_dispatch_recommendations(
 id uuid primary key,
 tenant_id uuid not null,
 job_id uuid,
 technician_id uuid,
 score numeric(8,4),
 explanation text,
 created_at timestamptz default now()
);

CREATE TABLE predictive_maintenance_events(
 id uuid primary key,
 tenant_id uuid not null,
 equipment_id uuid,
 predicted_failure_date date,
 confidence numeric(5,2),
 recommendation text
);

CREATE TABLE technician_productivity(
 id uuid primary key,
 tenant_id uuid not null,
 technician_id uuid,
 metric_date date,
 jobs_completed integer,
 revenue numeric(12,2),
 utilization numeric(5,2)
);

CREATE TABLE customer_lifetime_value(
 id uuid primary key,
 tenant_id uuid not null,
 customer_id uuid,
 lifetime_revenue numeric(12,2),
 projected_value numeric(12,2),
 calculated_at timestamptz default now()
);

CREATE TABLE business_insight_snapshots(
 id uuid primary key,
 tenant_id uuid not null,
 snapshot_name text,
 payload jsonb default '{}'::jsonb,
 created_at timestamptz default now()
);
