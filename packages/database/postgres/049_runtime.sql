CREATE TABLE runtime_health_checks(
 id uuid primary key,
 component text,
 status text,
 checked_at timestamptz default now()
);
CREATE TABLE runtime_background_jobs(
 id uuid primary key,
 job_name text,
 status text,
 started_at timestamptz,
 finished_at timestamptz
);
