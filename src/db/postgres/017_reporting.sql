CREATE TABLE dashboard_widgets(
 id uuid primary key,
 tenant_id uuid not null,
 name text not null,
 widget_type text not null,
 configuration jsonb default '{}'::jsonb
);

CREATE TABLE saved_reports(
 id uuid primary key,
 tenant_id uuid not null,
 name text not null,
 definition jsonb not null
);

CREATE TABLE scheduled_reports(
 id uuid primary key,
 report_id uuid not null,
 schedule_cron text not null,
 recipients jsonb default '[]'::jsonb,
 enabled boolean default true
);

CREATE TABLE technician_scorecards(
 id uuid primary key,
 tenant_id uuid not null,
 technician_id uuid not null,
 score_date date not null,
 completed_jobs integer default 0,
 revenue numeric(12,2) default 0,
 customer_rating numeric(4,2) default 0
);

CREATE TABLE revenue_forecasts(
 id uuid primary key,
 tenant_id uuid not null,
 forecast_month date not null,
 projected_revenue numeric(12,2)
);
