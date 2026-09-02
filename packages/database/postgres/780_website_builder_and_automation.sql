BEGIN;

-- Website Builder Pages
CREATE TABLE IF NOT EXISTS website_pages (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  template text NOT NULL DEFAULT 'blank',
  page_order int NOT NULL DEFAULT 0,
  version int NOT NULL DEFAULT 1,
  published_at timestamptz,
  created_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Preserve website-builder tables created by earlier releases. Those tables
-- used company_id and a smaller page model, so CREATE TABLE IF NOT EXISTS alone
-- does not provide the columns required by this release.
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS tenant_id text;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'website_pages'
      AND column_name = 'company_id'
  ) THEN
    UPDATE website_pages SET tenant_id = company_id::text WHERE tenant_id IS NULL;
  END IF;
END $$;
UPDATE website_pages SET tenant_id = '__legacy__' WHERE tenant_id IS NULL;
ALTER TABLE website_pages ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS sections jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS seo jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS template text NOT NULL DEFAULT 'blank';
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS page_order int NOT NULL DEFAULT 0;
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS version int NOT NULL DEFAULT 1;
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS created_by text NOT NULL DEFAULT '';

CREATE UNIQUE INDEX IF NOT EXISTS website_pages_tenant_slug_idx ON website_pages (tenant_id, slug);
CREATE INDEX IF NOT EXISTS website_pages_tenant_status_idx ON website_pages (tenant_id, status);

-- Website Themes
CREATE TABLE IF NOT EXISTS website_themes (
  tenant_id text PRIMARY KEY,
  primary_color text NOT NULL DEFAULT '#1a73e8',
  secondary_color text NOT NULL DEFAULT '#34a853',
  font_family text NOT NULL DEFAULT 'Inter, sans-serif',
  header_style text NOT NULL DEFAULT 'fixed',
  footer_style text NOT NULL DEFAULT 'standard',
  custom_css text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE website_themes ADD COLUMN IF NOT EXISTS tenant_id text;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'website_themes'
      AND column_name = 'id'
  ) THEN
    UPDATE website_themes SET tenant_id = id::text WHERE tenant_id IS NULL;
  END IF;
END $$;
UPDATE website_themes SET tenant_id = '__legacy__' WHERE tenant_id IS NULL;
ALTER TABLE website_themes ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE website_themes ADD COLUMN IF NOT EXISTS primary_color text NOT NULL DEFAULT '#1a73e8';
ALTER TABLE website_themes ADD COLUMN IF NOT EXISTS secondary_color text NOT NULL DEFAULT '#34a853';
ALTER TABLE website_themes ADD COLUMN IF NOT EXISTS font_family text NOT NULL DEFAULT 'Inter, sans-serif';
ALTER TABLE website_themes ADD COLUMN IF NOT EXISTS header_style text NOT NULL DEFAULT 'fixed';
ALTER TABLE website_themes ADD COLUMN IF NOT EXISTS footer_style text NOT NULL DEFAULT 'standard';
ALTER TABLE website_themes ADD COLUMN IF NOT EXISTS custom_css text NOT NULL DEFAULT '';
ALTER TABLE website_themes ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS website_themes_tenant_idx ON website_themes (tenant_id);

-- Website Media Library
CREATE TABLE IF NOT EXISTS website_media (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  filename text NOT NULL,
  url text NOT NULL,
  mime_type text NOT NULL DEFAULT '',
  size_bytes bigint NOT NULL DEFAULT 0,
  alt text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE website_media ADD COLUMN IF NOT EXISTS tenant_id text;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'website_media'
      AND column_name = 'company_id'
  ) THEN
    UPDATE website_media SET tenant_id = company_id::text WHERE tenant_id IS NULL;
  END IF;
END $$;
UPDATE website_media SET tenant_id = '__legacy__' WHERE tenant_id IS NULL;
ALTER TABLE website_media ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE website_media ADD COLUMN IF NOT EXISTS filename text NOT NULL DEFAULT '';
ALTER TABLE website_media ADD COLUMN IF NOT EXISTS mime_type text NOT NULL DEFAULT '';
ALTER TABLE website_media ADD COLUMN IF NOT EXISTS size_bytes bigint NOT NULL DEFAULT 0;
ALTER TABLE website_media ADD COLUMN IF NOT EXISTS alt text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS website_media_tenant_idx ON website_media (tenant_id, created_at DESC);

-- Automation Workflows
CREATE TABLE IF NOT EXISTS automation_workflows (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  trigger_type text NOT NULL DEFAULT 'manual',
  trigger_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  execution_count int NOT NULL DEFAULT 0,
  last_executed_at timestamptz,
  created_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS automation_workflows_tenant_status_idx ON automation_workflows (tenant_id, status);

-- Automation Execution History
CREATE TABLE IF NOT EXISTS automation_executions (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  workflow_id text NOT NULL,
  workflow_name text NOT NULL DEFAULT '',
  trigger_type text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  steps_executed int NOT NULL DEFAULT 0,
  step_results jsonb NOT NULL DEFAULT '[]'::jsonb,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE automation_executions ADD COLUMN IF NOT EXISTS workflow_id text NOT NULL DEFAULT '';
ALTER TABLE automation_executions ADD COLUMN IF NOT EXISTS workflow_name text NOT NULL DEFAULT '';
ALTER TABLE automation_executions ADD COLUMN IF NOT EXISTS trigger_type text NOT NULL DEFAULT '';
ALTER TABLE automation_executions ADD COLUMN IF NOT EXISTS steps_executed int NOT NULL DEFAULT 0;
ALTER TABLE automation_executions ADD COLUMN IF NOT EXISTS step_results jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE automation_executions ADD COLUMN IF NOT EXISTS context jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE automation_executions ADD COLUMN IF NOT EXISTS started_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE automation_executions ADD COLUMN IF NOT EXISTS completed_at timestamptz;

CREATE INDEX IF NOT EXISTS automation_executions_workflow_idx ON automation_executions (tenant_id, workflow_id, started_at DESC);

-- AI Knowledge Base
CREATE TABLE IF NOT EXISTS ai_knowledge (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'published',
  -- Embeddings are not queried by the current runtime. Store provider-neutral JSON
  -- until vector search is introduced through an explicit optional extension migration.
  embedding jsonb,
  view_count int NOT NULL DEFAULT 0,
  helpful_count int NOT NULL DEFAULT 0,
  created_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_knowledge_tenant_category_idx ON ai_knowledge (tenant_id, category);
CREATE INDEX IF NOT EXISTS ai_knowledge_tenant_status_idx ON ai_knowledge (tenant_id, status);

COMMIT;
