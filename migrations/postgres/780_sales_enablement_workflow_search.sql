-- Migration 780: Sales Enablement, Workflow Enhancements, Global Search
-- ServicePRO Supercharge Waves 7-9
-- Idempotent: uses IF NOT EXISTS

-- =============================================================================
-- 1. SALES SEQUENCES (multi-step automated outreach)
-- =============================================================================

CREATE TABLE IF NOT EXISTS sales_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]',       -- [{order, type, delay_days, template_id, subject, content, task_type}]
  settings JSONB NOT NULL DEFAULT '{}',    -- {daily_send_limit, stop_on_reply, stop_on_meeting, sender_id}
  is_active BOOLEAN NOT NULL DEFAULT true,
  enrolled_count INTEGER NOT NULL DEFAULT 0,
  completed_count INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  owner_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_sequences_tenant ON sales_sequences(tenant_id);

CREATE TABLE IF NOT EXISTS sequence_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  sequence_id UUID NOT NULL REFERENCES sales_sequences(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'replied', 'bounced', 'unenrolled')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_step_at TIMESTAMPTZ,
  next_step_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  unenrolled_reason TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_tenant ON sequence_enrollments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_sequence ON sequence_enrollments(tenant_id, sequence_id);
CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_contact ON sequence_enrollments(tenant_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_next ON sequence_enrollments(next_step_at) WHERE status = 'active';

-- =============================================================================
-- 2. MEETING SCHEDULER (booking pages)
-- =============================================================================

CREATE TABLE IF NOT EXISTS meeting_booking_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  buffer_minutes INTEGER NOT NULL DEFAULT 0,
  availability JSONB NOT NULL DEFAULT '{}',  -- {monday: [{start: "09:00", end: "17:00"}], ...}
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  location TEXT,                             -- 'phone', 'video', 'in_person', URL
  questions JSONB DEFAULT '[]',              -- custom form fields for booker
  settings JSONB NOT NULL DEFAULT '{}',      -- {confirmation_email, reminder_minutes, max_per_day}
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_meeting_booking_pages_tenant ON meeting_booking_pages(tenant_id);

CREATE TABLE IF NOT EXISTS meeting_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  booking_page_id UUID NOT NULL REFERENCES meeting_booking_pages(id),
  contact_id UUID,
  guest_name TEXT,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'rescheduled', 'completed', 'no_show')),
  notes TEXT,
  answers JSONB DEFAULT '{}',              -- responses to custom questions
  outcome TEXT,                            -- post-meeting outcome
  cancelled_at TIMESTAMPTZ,
  rescheduled_from TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meeting_bookings_page ON meeting_bookings(tenant_id, booking_page_id);
CREATE INDEX IF NOT EXISTS idx_meeting_bookings_time ON meeting_bookings(tenant_id, start_time);
CREATE INDEX IF NOT EXISTS idx_meeting_bookings_contact ON meeting_bookings(tenant_id, contact_id);

-- =============================================================================
-- 3. CALL LOGGING
-- =============================================================================

CREATE TABLE IF NOT EXISTS call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  caller_id TEXT NOT NULL,                -- user who made/received the call
  contact_id UUID,
  deal_id UUID,
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
  outcome TEXT NOT NULL DEFAULT 'connected' CHECK (outcome IN ('connected', 'no_answer', 'voicemail', 'busy', 'wrong_number')),
  duration_seconds INTEGER DEFAULT 0,
  notes TEXT,
  recording_url TEXT,
  recording_consent BOOLEAN DEFAULT false,
  summary TEXT,                            -- AI-generated or manual summary
  follow_up_task_id UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_call_logs_tenant ON call_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_contact ON call_logs(tenant_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_deal ON call_logs(tenant_id, deal_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_caller ON call_logs(tenant_id, caller_id);

-- =============================================================================
-- 4. WORKFLOW AUTOMATION RULES (extend for new entities)
-- =============================================================================

CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,              -- 'deal_stage_changed', 'ticket_created', 'board_item_status', 'sla_breach', 'form_submitted', 'contact_lifecycle', etc.
  trigger_config JSONB NOT NULL DEFAULT '{}',
  conditions JSONB NOT NULL DEFAULT '[]',  -- [{field, operator, value}]
  actions JSONB NOT NULL DEFAULT '[]',     -- [{type, config}]
  is_active BOOLEAN NOT NULL DEFAULT true,
  execution_count INTEGER NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_tenant ON automation_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON automation_rules(tenant_id, trigger_type);

CREATE TABLE IF NOT EXISTS automation_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  trigger_data JSONB NOT NULL DEFAULT '{}',
  conditions_met BOOLEAN NOT NULL DEFAULT true,
  actions_executed JSONB NOT NULL DEFAULT '[]',  -- [{action_type, status, result, error}]
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'partial', 'failed', 'skipped')),
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_executions_rule ON automation_executions(tenant_id, rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_time ON automation_executions(tenant_id, executed_at DESC);

-- =============================================================================
-- 5. DATA IMPORTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS data_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,               -- 'contact', 'company', 'deal', 'ticket', 'job'
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'mapping', 'processing', 'completed', 'failed')),
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  created_rows INTEGER DEFAULT 0,
  updated_rows INTEGER DEFAULT 0,
  skipped_rows INTEGER DEFAULT 0,
  error_rows INTEGER DEFAULT 0,
  field_mapping JSONB DEFAULT '{}',        -- {csv_column: entity_field}
  errors JSONB DEFAULT '[]',               -- [{row, field, error}]
  options JSONB DEFAULT '{}',              -- {update_existing, skip_duplicates, delimiter}
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_imports_tenant ON data_imports(tenant_id);
