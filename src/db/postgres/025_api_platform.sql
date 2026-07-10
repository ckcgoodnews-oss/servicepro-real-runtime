CREATE TABLE api_clients(
 id uuid primary key,
 tenant_id uuid not null,
 name text not null,
 client_id text not null unique,
 client_secret_hash text not null,
 active boolean default true
);

CREATE TABLE api_keys(
 id uuid primary key,
 tenant_id uuid not null,
 key_name text,
 key_hash text not null,
 scopes jsonb default '[]'::jsonb,
 active boolean default true,
 expires_at timestamptz
);

CREATE TABLE webhook_endpoints(
 id uuid primary key,
 tenant_id uuid not null,
 url text not null,
 signing_secret text not null,
 active boolean default true
);

CREATE TABLE webhook_subscriptions(
 id uuid primary key,
 endpoint_id uuid not null,
 event_name text not null
);

CREATE TABLE integration_catalog(
 id uuid primary key,
 provider text not null,
 category text,
 configuration jsonb default '{}'::jsonb
);

CREATE TABLE api_rate_limits(
 id uuid primary key,
 tenant_id uuid,
 requests_per_minute integer default 300,
 burst_limit integer default 600
);
