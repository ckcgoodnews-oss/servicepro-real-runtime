CREATE TABLE inventory_items(
 id uuid primary key,
 tenant_id uuid not null,
 sku text not null,
 description text,
 barcode text,
 unit_cost numeric(12,2),
 quantity_on_hand numeric(12,2) default 0
);

CREATE TABLE vendors(
 id uuid primary key,
 tenant_id uuid not null,
 name text not null,
 phone text,
 email text
);

CREATE TABLE purchase_orders(
 id uuid primary key,
 tenant_id uuid not null,
 vendor_id uuid,
 status text default 'draft',
 order_date date
);

CREATE TABLE warehouse_locations(
 id uuid primary key,
 tenant_id uuid not null,
 name text not null
);

CREATE TABLE truck_inventory(
 id uuid primary key,
 tenant_id uuid not null,
 truck_identifier text not null,
 inventory_item_id uuid not null,
 quantity numeric(12,2) default 0
);

CREATE TABLE inventory_transfers(
 id uuid primary key,
 tenant_id uuid not null,
 inventory_item_id uuid not null,
 from_location text,
 to_location text,
 quantity numeric(12,2),
 transferred_at timestamptz default now()
);
