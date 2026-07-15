CREATE TABLE IF NOT EXISTS knowledge_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, title text NOT NULL,
  article_type text NOT NULL DEFAULT 'article' CHECK (article_type IN ('article','manual')),
  category text NOT NULL DEFAULT 'general', manufacturer text NOT NULL DEFAULT '', model text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '', ai_summary text NOT NULL DEFAULT '', tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published','archived')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_tenant_updated ON knowledge_articles (tenant_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_tenant_type_category ON knowledge_articles (tenant_id, article_type, category, status);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_search ON knowledge_articles USING gin (to_tsvector('english', title || ' ' || content || ' ' || ai_summary));
