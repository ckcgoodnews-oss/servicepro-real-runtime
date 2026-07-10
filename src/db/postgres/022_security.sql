CREATE TABLE audit_events(
 id uuid primary key,
 tenant_id uuid not null,
 actor_id uuid,
 event_type text not null,
 entity_type text,
 entity_id uuid,
 payload jsonb default '{}'::jsonb,
 occurred_at timestamptz default now()
);

CREATE TABLE security_policies(
 id uuid primary key,
 tenant_id uuid not null,
 password_min_length integer default 12,
 require_mfa boolean default false,
 session_timeout_minutes integer default 480
);

CREATE TABLE mfa_enrollments(
 id uuid primary key,
 user_id uuid not null,
 provider text not null,
 enabled boolean default true,
 enrolled_at timestamptz default now()
);

CREATE TABLE trusted_devices(
 id uuid primary key,
 user_id uuid not null,
 device_name text,
 fingerprint text,
 last_seen timestamptz
);

CREATE TABLE user_sessions(
 id uuid primary key,
 user_id uuid not null,
 session_token_hash text not null,
 ip_address text,
 user_agent text,
 expires_at timestamptz
);

CREATE TABLE login_history(
 id uuid primary key,
 user_id uuid not null,
 login_time timestamptz default now(),
 ip_address text,
 success boolean default true
);

CREATE TABLE compliance_reports(
 id uuid primary key,
 tenant_id uuid not null,
 report_name text,
 generated_at timestamptz default now(),
 storage_key text
);
