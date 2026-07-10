CREATE TABLE appointment_requests(
 id uuid primary key,
 tenant_id uuid not null,
 customer_id uuid not null,
 requested_start timestamptz,
 requested_end timestamptz,
 status text default 'pending'
);

CREATE TABLE technician_availability(
 id uuid primary key,
 tenant_id uuid not null,
 technician_id uuid not null,
 starts_at timestamptz,
 ends_at timestamptz
);

CREATE TABLE calendar_sync_accounts(
 id uuid primary key,
 tenant_id uuid not null,
 provider text not null,
 account_identifier text
);
