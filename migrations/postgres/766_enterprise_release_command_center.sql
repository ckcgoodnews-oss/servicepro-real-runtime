create table if not exists release_environment_status (
  id bigserial primary key,
  environment_name text not null unique,
  current_release_id text,
  health text not null default 'unknown',
  active_rollout_id text,
  active_rollout_state text,
  open_incident_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_release_environment_status_health
  on release_environment_status (health, updated_at desc);

create table if not exists release_timeline_events (
  id bigserial primary key,
  event_id text not null unique,
  source text not null,
  event_type text not null,
  occurred_at timestamptz not null,
  release_id text,
  environment_name text,
  title text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_release_timeline_events_time
  on release_timeline_events (occurred_at desc);

create index if not exists idx_release_timeline_events_release
  on release_timeline_events (release_id, occurred_at desc);

create index if not exists idx_release_timeline_events_environment
  on release_timeline_events (environment_name, occurred_at desc);

create table if not exists release_command_center_audit (
  id bigserial primary key,
  audit_hash text not null unique,
  actor text not null,
  action text not null,
  resource_type text not null,
  resource_id text not null,
  outcome text not null,
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_release_command_center_audit_time
  on release_command_center_audit (occurred_at desc);

create index if not exists idx_release_command_center_audit_actor
  on release_command_center_audit (actor, occurred_at desc);

create or replace view release_command_center_environment_status as
select
  environment_name,
  current_release_id,
  health,
  active_rollout_id,
  active_rollout_state,
  open_incident_count,
  updated_at
from release_environment_status;

create or replace view release_command_center_timeline as
select
  event_id,
  source,
  event_type,
  occurred_at,
  release_id,
  environment_name,
  title,
  details
from release_timeline_events;
