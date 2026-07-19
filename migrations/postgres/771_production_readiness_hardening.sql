create table if not exists production_readiness_reports (
  id bigserial primary key,
  release_id text not null,
  ready boolean not null,
  category_summary jsonb not null,
  failed_checks jsonb not null default '[]'::jsonb,
  missing_approvals jsonb not null default '[]'::jsonb,
  certificate jsonb,
  evaluated_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_production_readiness_reports_release
  on production_readiness_reports (release_id, evaluated_at desc);

create table if not exists production_security_reports (
  id bigserial primary key,
  hardened boolean not null,
  findings jsonb not null default '[]'::jsonb,
  blocking_findings jsonb not null default '[]'::jsonb,
  evaluated_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_production_security_reports_time
  on production_security_reports (evaluated_at desc);
