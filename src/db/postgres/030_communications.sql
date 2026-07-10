CREATE TABLE communication_preferences(
 id uuid primary key,
 tenant_id uuid not null,
 customer_id uuid not null,
 email_opt_in boolean default true,
 sms_opt_in boolean default true,
 marketing_opt_in boolean default false
);

CREATE TABLE email_templates(
 id uuid primary key,
 tenant_id uuid not null,
 name text not null,
 subject text not null,
 body text not null,
 active boolean default true
);

CREATE TABLE sms_templates(
 id uuid primary key,
 tenant_id uuid not null,
 name text not null,
 body text not null,
 active boolean default true
);

CREATE TABLE communication_history(
 id uuid primary key,
 tenant_id uuid not null,
 customer_id uuid,
 channel text not null,
 template_name text,
 status text,
 sent_at timestamptz default now()
);

CREATE TABLE campaign_schedules(
 id uuid primary key,
 tenant_id uuid not null,
 campaign_name text not null,
 channel text not null,
 scheduled_at timestamptz,
 status text default 'draft'
);
