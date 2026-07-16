-- Sprint 89 PostgreSQL migration: SLA policies and timers.

CREATE TABLE IF NOT EXISTS sla_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'normal',
  response_minutes integer NOT NULL DEFAULT 60,
  resolution_minutes integer NOT NULL DEFAULT 1440,
  warning_before_minutes integer NOT NULL DEFAULT 15,
  applies_to_service_type text NOT NULL DEFAULT '',
  applies_to_agreement_tier text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Sprint 47 introduced the initial SLA table. Preserve its completion target
-- while upgrading the table to the executable runtime contract.
ALTER TABLE sla_policies RENAME COLUMN completion_minutes TO resolution_minutes;
ALTER TABLE sla_policies ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE sla_policies ALTER COLUMN tenant_id TYPE text USING tenant_id::text;
ALTER TABLE sla_policies ALTER COLUMN priority SET DEFAULT 'normal';
ALTER TABLE sla_policies ALTER COLUMN response_minutes SET DEFAULT 60;
ALTER TABLE sla_policies ALTER COLUMN resolution_minutes SET DEFAULT 1440;
ALTER TABLE sla_policies ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE sla_policies ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE sla_policies ADD COLUMN IF NOT EXISTS warning_before_minutes integer NOT NULL DEFAULT 15;
ALTER TABLE sla_policies ADD COLUMN IF NOT EXISTS applies_to_service_type text NOT NULL DEFAULT '';
ALTER TABLE sla_policies ADD COLUMN IF NOT EXISTS applies_to_agreement_tier text NOT NULL DEFAULT '';
ALTER TABLE sla_policies ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
ALTER TABLE sla_policies ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE sla_policies ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE sla_policies ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS sla_timers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  job_id uuid NOT NULL,
  customer_id uuid,
  policy_id uuid NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL,
  response_due_at timestamptz NOT NULL,
  resolution_due_at timestamptz NOT NULL,
  responded_at timestamptz,
  resolved_at timestamptz,
  breached_at timestamptz,
  breach_reason text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sla_policies_tenant_active
ON sla_policies (tenant_id, active, priority);

CREATE INDEX IF NOT EXISTS idx_sla_timers_tenant_job
ON sla_timers (tenant_id, job_id);

CREATE INDEX IF NOT EXISTS idx_sla_timers_tenant_status_response
ON sla_timers (tenant_id, status, response_due_at);

CREATE INDEX IF NOT EXISTS idx_sla_timers_tenant_status_resolution
ON sla_timers (tenant_id, status, resolution_due_at);
