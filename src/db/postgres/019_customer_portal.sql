CREATE TABLE portal_users(
 id uuid primary key,
 tenant_id uuid not null,
 customer_id uuid not null,
 email text not null,
 password_hash text not null,
 enabled boolean default true
);

CREATE TABLE estimates(
 id uuid primary key,
 tenant_id uuid not null,
 customer_id uuid not null,
 total numeric(12,2),
 status text default 'draft'
);

CREATE TABLE estimate_signatures(
 id uuid primary key,
 estimate_id uuid not null,
 signed_name text,
 signed_at timestamptz
);

CREATE TABLE customer_documents(
 id uuid primary key,
 tenant_id uuid not null,
 customer_id uuid not null,
 file_name text,
 storage_key text,
 uploaded_at timestamptz default now()
);

CREATE TABLE payment_transactions(
 id uuid primary key,
 tenant_id uuid not null,
 customer_id uuid not null,
 invoice_id uuid,
 amount numeric(12,2),
 provider text,
 status text
);

CREATE TABLE portal_messages(
 id uuid primary key,
 tenant_id uuid not null,
 customer_id uuid not null,
 subject text,
 body text,
 created_at timestamptz default now()
);
