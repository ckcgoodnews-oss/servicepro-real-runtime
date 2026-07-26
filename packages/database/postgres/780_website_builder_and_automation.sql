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
  embedding vector(1536),
  view_count int NOT NULL DEFAULT 0,
  helpful_count int NOT NULL DEFAULT 0,
  created_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_knowledge_tenant_category_idx ON ai_knowledge (tenant_id, category);
CREATE INDEX IF NOT EXISTS ai_knowledge_tenant_status_idx ON ai_knowledge (tenant_id, status);

COMMIT;
