create table if not exists release_policy_simulations (
  id bigserial primary key,
  release_id text,
  baseline jsonb not null,
  scenarios jsonb not null,
  input_data jsonb not null,
  simulated_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_release_policy_simulations_release
  on release_policy_simulations (release_id, simulated_at desc);

create table if not exists cd_control_optimization_reports (
  id bigserial primary key,
  metrics jsonb not null,
  recommendations jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_cd_control_optimization_reports_generated
  on cd_control_optimization_reports (generated_at desc);

create table if not exists cd_control_policy_versions (
  id bigserial primary key,
  version_number bigint generated always as identity,
  policy jsonb not null,
  approved_by text,
  approval_reference text,
  activated_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_cd_control_policy_versions_active
  on cd_control_policy_versions (activated_at desc);
