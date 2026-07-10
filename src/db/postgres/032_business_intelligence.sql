CREATE TABLE kpi_definitions(id uuid primary key,tenant_id uuid not null,code text,name text);
CREATE TABLE dashboard_definitions(id uuid primary key,tenant_id uuid not null,name text,layout jsonb);
CREATE TABLE analytics_filters(id uuid primary key,tenant_id uuid not null,filter_json jsonb);
CREATE TABLE forecast_snapshots(id uuid primary key,tenant_id uuid not null,metric text,value numeric);
CREATE TABLE executive_alerts(id uuid primary key,tenant_id uuid not null,message text);
