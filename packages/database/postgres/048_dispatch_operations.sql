CREATE TABLE dispatch_boards(id uuid primary key,tenant_id uuid,name text);
CREATE TABLE technician_locations(id uuid primary key,tenant_id uuid,technician_id uuid,latitude numeric,longitude numeric,recorded_at timestamptz);
CREATE TABLE eta_notifications(id uuid primary key,tenant_id uuid,job_id uuid,customer_id uuid,eta_minutes integer,status text);
CREATE TABLE calendar_sync_accounts(id uuid primary key,tenant_id uuid,provider text,account_email text,last_sync timestamptz);
CREATE TABLE labor_rules(id uuid primary key,tenant_id uuid,name text,max_hours numeric,overtime_after numeric);
CREATE TABLE dispatch_analytics(id uuid primary key,tenant_id uuid,metric_name text,metric_value numeric,captured_at timestamptz default now());
