-- Sprint 258: Long Term Support Channels
CREATE TABLE IF NOT EXISTS phase15_258_long_term_support_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase15_258_long_term_support_channels_tenant_status ON phase15_258_long_term_support_channels (tenant_id, status);
