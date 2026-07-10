-- Sprint 84 PostgreSQL migration: reminders and follow-ups.

CREATE TABLE IF NOT EXISTS reminder_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  trigger_type text NOT NULL,
  entity_type text NOT NULL DEFAULT 'customer',
  offset_days integer NOT NULL DEFAULT 0,
  default_priority text NOT NULL DEFAULT 'normal',
  default_channel text NOT NULL DEFAULT 'internal_note',
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  customer_id uuid NOT NULL,
  entity_type text NOT NULL DEFAULT 'customer',
  entity_id text NOT NULL DEFAULT '',
  job_id uuid,
  invoice_id uuid,
  estimate_id uuid,
  agreement_id uuid,
  assigned_to text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  channel text NOT NULL DEFAULT 'internal_note',
  completed_at timestamptz,
  snoozed_until date,
  source_rule_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminder_rules_tenant_active
ON reminder_rules (tenant_id, active, trigger_type);

CREATE INDEX IF NOT EXISTS idx_follow_ups_tenant_due
ON follow_ups (tenant_id, status, due_date);

CREATE INDEX IF NOT EXISTS idx_follow_ups_tenant_customer
ON follow_ups (tenant_id, customer_id, due_date);

CREATE INDEX IF NOT EXISTS idx_follow_ups_tenant_assigned
ON follow_ups (tenant_id, assigned_to, status, due_date);
