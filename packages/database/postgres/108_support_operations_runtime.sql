-- Sprint 108 PostgreSQL migration: enterprise support operations runtime.

CREATE TABLE IF NOT EXISTS support_sla_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  first_response_minutes integer NOT NULL DEFAULT 240,
  resolution_minutes integer NOT NULL DEFAULT 2880,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text NOT NULL UNIQUE,
  tenant_id text NOT NULL DEFAULT '',
  customer_id text NOT NULL DEFAULT '',
  requester_name text NOT NULL DEFAULT '',
  requester_email text NOT NULL DEFAULT '',
  subject text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  priority text NOT NULL DEFAULT 'normal',
  severity text NOT NULL DEFAULT 'sev4',
  assigned_team text NOT NULL DEFAULT 'support',
  assigned_to text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'manual',
  opened_at timestamptz NOT NULL,
  first_response_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL,
  author_id text NOT NULL DEFAULT '',
  author_name text NOT NULL DEFAULT '',
  body text NOT NULL,
  internal boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'open',
  reason text NOT NULL,
  escalated_by text NOT NULL DEFAULT '',
  escalated_to text NOT NULL DEFAULT 'support-lead',
  escalated_at timestamptz NOT NULL,
  acknowledged_by text NOT NULL DEFAULT '',
  acknowledged_at timestamptz,
  resolved_by text NOT NULL DEFAULT '',
  resolved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_knowledge_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  category text NOT NULL DEFAULT 'general',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by text NOT NULL DEFAULT '',
  published_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_health_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  signal_type text NOT NULL,
  direction text NOT NULL DEFAULT 'neutral',
  score_delta numeric(8,2) NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  source_id text NOT NULL DEFAULT '',
  source_type text NOT NULL DEFAULT '',
  observed_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_status ON support_tickets (tenant_id, status, priority, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_comments_ticket ON support_ticket_comments (ticket_id, created_at);
CREATE INDEX IF NOT EXISTS idx_support_escalations_ticket_status ON support_escalations (ticket_id, status, escalated_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_knowledge_articles_status_category ON support_knowledge_articles (status, category, title);
CREATE INDEX IF NOT EXISTS idx_customer_health_tenant_type ON customer_health_signals (tenant_id, signal_type, observed_at DESC);
