-- Sprint 78 PostgreSQL migration: price book and flat-rate catalog.

CREATE TABLE IF NOT EXISTS price_book_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS price_book_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  category_id uuid,
  category_code text NOT NULL DEFAULT '',
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  unit text NOT NULL DEFAULT 'each',
  base_price numeric(12,2) NOT NULL DEFAULT 0,
  labor_hours numeric(8,2) NOT NULL DEFAULT 0,
  material_cost numeric(12,2) NOT NULL DEFAULT 0,
  unit_cost numeric(12,2) NOT NULL DEFAULT 0,
  taxable boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  version integer NOT NULL DEFAULT 1,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS price_book_publish_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  item_count integer NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_book_categories_tenant_active
ON price_book_categories (tenant_id, active, sort_order);

CREATE INDEX IF NOT EXISTS idx_price_book_items_tenant_category
ON price_book_items (tenant_id, category_code, active);

CREATE INDEX IF NOT EXISTS idx_price_book_items_tenant_code
ON price_book_items (tenant_id, code);
