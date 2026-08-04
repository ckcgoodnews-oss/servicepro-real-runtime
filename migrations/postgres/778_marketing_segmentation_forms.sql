-- Migration 778: Marketing Segmentation, Lead Capture Forms & Campaign Attribution
-- ServicePRO Supercharge Wave 4
-- Idempotent: uses IF NOT EXISTS

-- =============================================================================
-- 1. AUDIENCE SEGMENTS (dynamic + static lists)
-- =============================================================================

CREATE TABLE IF NOT EXISTS audience_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  segment_type TEXT NOT NULL DEFAULT 'dynamic' CHECK (segment_type IN ('dynamic', 'static')),
  criteria JSONB DEFAULT '{}',         -- for dynamic: filter rules [{field, operator, value, logic}]
  contact_ids TEXT[] DEFAULT '{}',     -- for static: explicit member list
  member_count INTEGER NOT NULL DEFAULT 0,
  last_evaluated_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audience_segments_tenant ON audience_segments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audience_segments_type ON audience_segments(tenant_id, segment_type);

-- =============================================================================
-- 2. LEAD CAPTURE FORMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS lead_capture_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,                  -- URL-safe identifier for embed
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]',  -- [{name, label, type, required, options, placeholder, hidden}]
  settings JSONB NOT NULL DEFAULT '{}',-- {submit_message, redirect_url, notify_emails, spam_protection}
  style JSONB NOT NULL DEFAULT '{}',   -- {theme, button_text, button_color}
  campaign_id UUID,                    -- attribute submissions to a campaign
  segment_id UUID,                     -- add submitters to segment
  is_active BOOLEAN NOT NULL DEFAULT true,
  submission_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_lead_capture_forms_tenant ON lead_capture_forms(tenant_id);

CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  form_id UUID NOT NULL REFERENCES lead_capture_forms(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',    -- field_name: value pairs
  contact_id UUID,                     -- resolved contact after dedup
  lead_id TEXT,                        -- resolved lead
  source_url TEXT,                     -- page URL where form was submitted
  ip_address TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_tenant ON form_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form ON form_submissions(tenant_id, form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_contact ON form_submissions(tenant_id, contact_id);

-- =============================================================================
-- 3. CAMPAIGN ATTRIBUTION
-- =============================================================================

CREATE TABLE IF NOT EXISTS campaign_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT,
  entity_type TEXT NOT NULL,           -- 'lead', 'contact', 'deal', 'customer'
  entity_id TEXT NOT NULL,
  attribution_model TEXT NOT NULL DEFAULT 'first_touch' CHECK (attribution_model IN ('first_touch', 'last_touch', 'linear', 'time_decay')),
  touch_type TEXT NOT NULL,            -- 'form_submit', 'email_open', 'email_click', 'ad_click', 'organic'
  channel TEXT,                        -- 'email', 'paid_search', 'organic', 'social', 'referral', 'direct'
  revenue_attributed NUMERIC(12,2) DEFAULT 0,
  utm_source TEXT,
  utm_medium TEXT,
  utm_content TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaign_attribution_tenant ON campaign_attribution(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_attribution_campaign ON campaign_attribution(tenant_id, campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_attribution_entity ON campaign_attribution(tenant_id, entity_type, entity_id);

-- =============================================================================
-- 4. EMAIL CAMPAIGN SENDS (extend existing campaign system)
-- =============================================================================

CREATE TABLE IF NOT EXISTS campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  contact_id UUID,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complained')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounce_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaign_sends_tenant ON campaign_sends(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_campaign ON campaign_sends(tenant_id, campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_contact ON campaign_sends(tenant_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_status ON campaign_sends(tenant_id, status);
