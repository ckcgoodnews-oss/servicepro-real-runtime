-- Sprint 43 PostgreSQL migration: frontend layout, branding, and navigation metadata.

CREATE TABLE IF NOT EXISTS tenant_frontend_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE,
  public_home_enabled boolean NOT NULL DEFAULT true,
  customer_portal_enabled boolean NOT NULL DEFAULT true,
  admin_theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  public_theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  custom_navigation jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_table_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid,
  entity_type text NOT NULL,
  name text NOT NULL,
  columns jsonb NOT NULL DEFAULT '[]'::jsonb,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS form_layout_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  form_key text NOT NULL,
  layout jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_table_views_tenant_user
ON saved_table_views (tenant_id, user_id, entity_type);

CREATE INDEX IF NOT EXISTS idx_form_layout_definitions_form
ON form_layout_definitions (tenant_id, form_key);
