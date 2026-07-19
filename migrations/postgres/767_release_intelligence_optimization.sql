create table if not exists release_risk_evaluations (
  id bigserial primary key,
  release_id text,
  risk_score integer not null,
  risk_level text not null,
  blocked boolean not null default false,
  factors jsonb not null,
  recommendations jsonb not null default '[]'::jsonb,
  input_data jsonb not null,
  evaluated_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_release_risk_evaluations_release
  on release_risk_evaluations (release_id, evaluated_at desc);

create index if not exists idx_release_risk_evaluations_level
  on release_risk_evaluations (risk_level, evaluated_at desc);

create table if not exists deployment_optimization_reports (
  id bigserial primary key,
  metrics jsonb not null,
  strategy_performance jsonb not null,
  preferred_strategy jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_deployment_optimization_reports_generated
  on deployment_optimization_reports (generated_at desc);
