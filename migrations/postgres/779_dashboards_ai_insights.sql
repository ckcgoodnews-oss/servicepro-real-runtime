-- Migration 779: Configurable Dashboards & AI Insights
-- ServicePRO Supercharge Wave 5 + Wave 6
-- Idempotent: uses IF NOT EXISTS

-- =============================================================================
-- 1. CONFIGURABLE DASHBOARDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  layout JSONB NOT NULL DEFAULT '[]',  -- [{widget_id, x, y, w, h}]
  is_default BOOLEAN NOT NULL DEFAULT false,
  owner_id TEXT,
  shared_with TEXT[] DEFAULT '{}',     -- user IDs or role names
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dashboards_tenant ON dashboards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_owner ON dashboards(tenant_id, owner_id);

CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,           -- 'kpi', 'chart', 'table', 'funnel', 'pipeline', 'activity', 'map', 'gauge'
  title TEXT NOT NULL,
  data_source TEXT NOT NULL,           -- 'deals', 'tickets', 'jobs', 'invoices', 'contacts', 'campaigns', 'activities'
  config JSONB NOT NULL DEFAULT '{}',  -- filters, aggregation, display settings
  position JSONB NOT NULL DEFAULT '{}',-- {x, y, w, h}
  refresh_interval INTEGER DEFAULT 0, -- seconds, 0=manual
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_dashboard ON dashboard_widgets(tenant_id, dashboard_id);

-- =============================================================================
-- 2. AI INSIGHTS STORE
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,           -- 'deal', 'ticket', 'customer', 'lead', 'job', 'campaign'
  entity_id TEXT NOT NULL,
  insight_type TEXT NOT NULL,          -- 'deal_risk', 'churn_risk', 'next_action', 'ticket_routing', 'schedule_opt', 'anomaly'
  title TEXT NOT NULL,
  summary TEXT,
  detail JSONB DEFAULT '{}',           -- structured output from AI
  confidence NUMERIC(4,3),             -- 0.000 to 1.000
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'acted_on', 'expired')),
  source_model TEXT,                   -- which AI model generated
  source_context JSONB DEFAULT '{}',   -- input data fingerprint for audit
  expires_at TIMESTAMPTZ,
  acted_on_at TIMESTAMPTZ,
  acted_on_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_tenant ON ai_insights(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_entity ON ai_insights(tenant_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(tenant_id, insight_type, status);
CREATE INDEX IF NOT EXISTS idx_ai_insights_active ON ai_insights(tenant_id, status) WHERE status = 'active';
