-- Migration 776: Unified Record Associations, Deals, Activity Timeline, CRM Properties
-- ServicePRO Supercharge Wave 1
-- Idempotent: uses IF NOT EXISTS throughout

-- =============================================================================
-- 1. UNIFIED RECORD ASSOCIATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS record_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  source_type TEXT NOT NULL,          -- 'contact', 'company', 'deal', 'job', 'ticket', etc.
  source_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  association_type TEXT NOT NULL DEFAULT 'related', -- 'related', 'primary', 'parent', 'child'
  label TEXT,                          -- optional custom label
  is_primary BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT,
  UNIQUE(tenant_id, source_type, source_id, target_type, target_id, association_type)
);

CREATE INDEX IF NOT EXISTS idx_record_associations_tenant ON record_associations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_record_associations_source ON record_associations(tenant_id, source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_record_associations_target ON record_associations(tenant_id, target_type, target_id);

-- =============================================================================
-- 2. DEALS / OPPORTUNITIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS deal_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  stages JSONB NOT NULL DEFAULT '[]',  -- [{id, name, order, probability, requiredFields}]
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_pipelines_tenant ON deal_pipelines(tenant_id);

CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  pipeline_id UUID REFERENCES deal_pipelines(id),
  name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'new',
  amount NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  expected_close_date DATE,
  actual_close_date DATE,
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  owner_id TEXT,
  contact_id UUID,
  company_id UUID,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
  win_reason TEXT,
  loss_reason TEXT,
  competitor TEXT,
  source TEXT,
  notes TEXT,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_deals_tenant ON deals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline ON deals(tenant_id, pipeline_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(tenant_id, stage);
CREATE INDEX IF NOT EXISTS idx_deals_owner ON deals(tenant_id, owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(tenant_id, status);

-- Deal products (line items on deals)
CREATE TABLE IF NOT EXISTS deal_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  service_id UUID,
  name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_interval TEXT,  -- 'monthly', 'quarterly', 'annual'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_products_deal ON deal_products(tenant_id, deal_id);

-- =============================================================================
-- 3. UNIFIED ACTIVITY TIMELINE
-- =============================================================================

CREATE TABLE IF NOT EXISTS activity_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,           -- 'customer', 'deal', 'job', 'contact', etc.
  entity_id UUID NOT NULL,
  activity_type TEXT NOT NULL,         -- 'note', 'email', 'call', 'task', 'meeting', 'status_change', 'estimate', 'invoice', 'payment', 'work_order'
  title TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  performed_by TEXT,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_timeline_entity ON activity_timeline(tenant_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_timeline_tenant_time ON activity_timeline(tenant_id, performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_timeline_type ON activity_timeline(tenant_id, activity_type);

-- =============================================================================
-- 4. CRM CONTACTS (separate from customers/companies)
-- =============================================================================

CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  job_title TEXT,
  company_id UUID,                     -- link to customer record (company)
  lifecycle_stage TEXT NOT NULL DEFAULT 'subscriber' CHECK (lifecycle_stage IN ('subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist')),
  lead_status TEXT,
  owner_id TEXT,
  source TEXT,
  properties JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_tenant ON crm_contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_company ON crm_contacts(tenant_id, company_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_owner ON crm_contacts(tenant_id, owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_lifecycle ON crm_contacts(tenant_id, lifecycle_stage);

-- =============================================================================
-- 5. CONFIGURABLE CRM PROPERTIES (Custom Fields)
-- =============================================================================

CREATE TABLE IF NOT EXISTS crm_property_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  object_type TEXT NOT NULL,           -- 'contact', 'company', 'deal', 'ticket', 'job'
  name TEXT NOT NULL,                  -- internal name (snake_case)
  label TEXT NOT NULL,                 -- display label
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'number', 'currency', 'date', 'datetime', 'select', 'multiselect', 'checkbox', 'email', 'phone', 'url', 'user', 'formula')),
  property_group TEXT DEFAULT 'custom',
  description TEXT,
  options JSONB,                        -- for select/multiselect: [{value, label, color}]
  formula TEXT,                         -- for formula fields
  required BOOLEAN NOT NULL DEFAULT false,
  read_only BOOLEAN NOT NULL DEFAULT false,
  hidden BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  validation JSONB,                     -- {min, max, pattern, etc.}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, object_type, name)
);

CREATE INDEX IF NOT EXISTS idx_crm_properties_tenant_obj ON crm_property_definitions(tenant_id, object_type);

-- =============================================================================
-- 6. LEAD ASSIGNMENT RULES
-- =============================================================================

CREATE TABLE IF NOT EXISTS lead_assignment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  strategy TEXT NOT NULL DEFAULT 'round_robin' CHECK (strategy IN ('round_robin', 'territory', 'skill_based', 'load_balanced', 'manual')),
  criteria JSONB DEFAULT '{}',          -- conditions for when this rule applies
  assignees TEXT[] DEFAULT '{}',        -- user IDs eligible for assignment
  current_index INTEGER NOT NULL DEFAULT 0,  -- for round-robin tracking
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_assignment_rules_tenant ON lead_assignment_rules(tenant_id);

-- =============================================================================
-- 7. TASKS (Universal)
-- =============================================================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  owner_id TEXT,
  assigned_to TEXT,
  entity_type TEXT,                     -- linked entity type
  entity_id UUID,                       -- linked entity id
  task_type TEXT DEFAULT 'todo' CHECK (task_type IN ('todo', 'call', 'email', 'meeting', 'follow_up')),
  reminder_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_tenant ON tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(tenant_id, assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_tasks_entity ON tasks(tenant_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(tenant_id, due_date) WHERE status NOT IN ('completed', 'cancelled');
