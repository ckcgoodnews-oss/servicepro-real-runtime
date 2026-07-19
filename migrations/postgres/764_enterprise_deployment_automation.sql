create table if not exists release_rollouts (
  id bigserial primary key,
  rollout_id text not null unique,
  release_id text not null,
  strategy text not null,
  target_environment text not null,
  state text not null,
  current_step_index integer not null default -1,
  plan jsonb not null,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists idx_release_rollouts_release
  on release_rollouts (release_id, updated_at desc);

create index if not exists idx_release_rollouts_state
  on release_rollouts (state, updated_at desc);

create table if not exists release_rollback_authorizations (
  id bigserial primary key,
  rollback_id text not null unique,
  release_id text not null,
  previous_release_id text not null,
  change_ticket text not null,
  operator_identity text not null,
  trigger_reasons jsonb not null,
  authorized_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_release_rollback_authorizations_release
  on release_rollback_authorizations (release_id, authorized_at desc);
