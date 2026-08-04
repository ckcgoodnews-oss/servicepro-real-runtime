-- Migration 777: Work Management Boards & Ticketing System
-- ServicePRO Supercharge Wave 2 + Wave 3
-- Idempotent: uses IF NOT EXISTS throughout

-- =============================================================================
-- 1. CONFIGURABLE BOARDS (monday.com-class work management)
-- =============================================================================

CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  workspace_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  board_type TEXT NOT NULL DEFAULT 'main' CHECK (board_type IN ('main', 'private', 'shareable')),
  columns JSONB NOT NULL DEFAULT '[]',     -- [{id, name, type, settings, width, position}]
  settings JSONB NOT NULL DEFAULT '{}',    -- board-level settings
  template_id TEXT,                         -- if created from template
  owner_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_boards_tenant ON boards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_boards_workspace ON boards(tenant_id, workspace_id);

CREATE TABLE IF NOT EXISTS board_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#579bfc',
  position INTEGER NOT NULL DEFAULT 0,
  collapsed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_board_groups_board ON board_groups(tenant_id, board_id);

CREATE TABLE IF NOT EXISTS board_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  group_id UUID REFERENCES board_groups(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES board_items(id) ON DELETE CASCADE,  -- for subitems
  name TEXT NOT NULL,
  column_values JSONB NOT NULL DEFAULT '{}',  -- {column_id: value}
  position INTEGER NOT NULL DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_board_items_board ON board_items(tenant_id, board_id);
CREATE INDEX IF NOT EXISTS idx_board_items_group ON board_items(tenant_id, group_id);
CREATE INDEX IF NOT EXISTS idx_board_items_parent ON board_items(parent_id);

CREATE TABLE IF NOT EXISTS board_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  view_type TEXT NOT NULL CHECK (view_type IN ('table', 'kanban', 'calendar', 'timeline', 'gantt', 'chart', 'form')),
  settings JSONB NOT NULL DEFAULT '{}',    -- view-specific config (groupBy, sortBy, filters, etc.)
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_board_views_board ON board_views(tenant_id, board_id);

CREATE TABLE IF NOT EXISTS board_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT,                          -- NULL for system templates
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  columns JSONB NOT NULL DEFAULT '[]',
  groups JSONB NOT NULL DEFAULT '[]',
  views JSONB NOT NULL DEFAULT '[]',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_board_templates_tenant ON board_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_board_templates_category ON board_templates(category);

-- =============================================================================
-- 2. TICKETING SYSTEM (Customer Service Hub)
-- =============================================================================

CREATE TABLE IF NOT EXISTS ticket_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  statuses JSONB NOT NULL DEFAULT '[]',    -- [{id, name, category, color, order}] category: open|pending|closed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_pipelines_tenant ON ticket_pipelines(tenant_id);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  pipeline_id UUID REFERENCES ticket_pipelines(id),
  ticket_number SERIAL,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT,
  channel TEXT DEFAULT 'portal' CHECK (channel IN ('portal', 'email', 'phone', 'chat', 'form', 'api')),
  customer_id UUID,
  contact_id UUID,
  company_id UUID,
  equipment_id UUID,
  property_id UUID,
  work_order_id UUID,
  assigned_to TEXT,
  assigned_team TEXT,
  sla_policy_id UUID,
  sla_breach_at TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  resolution_notes TEXT,
  root_cause TEXT,
  tags TEXT[] DEFAULT '{}',
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(tenant_id, assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON tickets(tenant_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(tenant_id, priority);
CREATE INDEX IF NOT EXISTS idx_tickets_sla ON tickets(tenant_id, sla_breach_at) WHERE status NOT IN ('resolved', 'closed');

CREATE TABLE IF NOT EXISTS ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL,
  author_type TEXT NOT NULL DEFAULT 'agent' CHECK (author_type IN ('agent', 'customer', 'system')),
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,  -- internal notes not visible to customer
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON ticket_comments(tenant_id, ticket_id);

-- =============================================================================
-- 3. SLA POLICIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS sla_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  priority_targets JSONB NOT NULL DEFAULT '{}',  -- {urgent: {first_response_minutes, resolution_minutes}, high: {...}, ...}
  business_hours JSONB DEFAULT '{}',             -- {monday: {start: "09:00", end: "17:00"}, ...}
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sla_policies_tenant ON sla_policies(tenant_id);

-- =============================================================================
-- 4. KNOWLEDGE BASE (extend existing)
-- =============================================================================

CREATE TABLE IF NOT EXISTS kb_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES kb_categories(id),
  position INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT true,
  article_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kb_categories_tenant ON kb_categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kb_categories_slug ON kb_categories(tenant_id, slug);
