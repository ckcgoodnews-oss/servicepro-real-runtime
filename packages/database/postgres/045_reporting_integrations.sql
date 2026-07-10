CREATE TABLE report_definitions(id uuid primary key,name text,category text);
CREATE TABLE report_runs(id uuid primary key,report_id uuid,status text,started_at timestamptz default now());
CREATE TABLE webhook_subscriptions(id uuid primary key,tenant_id uuid,event text,target_url text,enabled boolean default true);
CREATE TABLE api_keys(id uuid primary key,tenant_id uuid,name text,key_hash text,created_at timestamptz default now());
