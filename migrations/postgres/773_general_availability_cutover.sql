create table if not exists ga_cutover_reports (id bigserial primary key, cutover_id text not null unique, release_id text not null, environment text not null, authorized boolean not null, report jsonb not null, evaluated_at timestamptz not null, created_at timestamptz not null default now());
create index if not exists idx_ga_cutover_release on ga_cutover_reports(release_id,evaluated_at desc);
create table if not exists ga_post_cutover_reports (id bigserial primary key, release_id text not null, validated boolean not null, decision text not null, report jsonb not null, evaluated_at timestamptz not null, created_at timestamptz not null default now());
create index if not exists idx_ga_post_cutover_release on ga_post_cutover_reports(release_id,evaluated_at desc);
