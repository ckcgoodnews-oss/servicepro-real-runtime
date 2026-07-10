CREATE TABLE deployment_environments(
 id uuid primary key,
 environment_name text,
 status text,
 created_at timestamptz default now()
);

CREATE TABLE backup_verifications(
 id uuid primary key,
 backup_name text,
 verified boolean,
 verified_at timestamptz
);

CREATE TABLE disaster_recovery_exercises(
 id uuid primary key,
 exercise_name text,
 outcome text,
 completed_at timestamptz
);

CREATE TABLE monitoring_alerts(
 id uuid primary key,
 alert_name text,
 severity text,
 status text,
 created_at timestamptz default now()
);

CREATE TABLE performance_baselines(
 id uuid primary key,
 metric_name text,
 baseline_value numeric,
 captured_at timestamptz default now()
);
