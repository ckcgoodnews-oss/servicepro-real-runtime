-- Sprint 74 PostgreSQL migration: tenant administration and white-label settings.

CREATE TABLE IF NOT EXISTS tenant_settings (
  tenant_id text PRIMARY KEY,
  company_name text NOT NULL DEFAULT '',
  legal_name text NOT NULL DEFAULT '',
  support_email text NOT NULL DEFAULT '',
  support_phone text NOT NULL DEFAULT '',
  timezone text NOT NULL DEFAULT 'UTC',
  locale text NOT NULL DEFAULT 'en-US',
  currency text NOT NULL DEFAULT 'USD',
  branding jsonb NOT NULL DEFAULT '{}'::jsonb,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO tenant_settings (
  tenant_id,
  company_name,
  legal_name,
  support_email,
  support_phone,
  timezone,
  locale,
  currency,
  branding,
  features
)
VALUES (
  'tenant_demo',
  'ServicePro Demo Plumbing',
  'ServicePro Demo Plumbing LLC',
  'support@example.com',
  '555-0100',
  'America/Indiana/Indianapolis',
  'en-US',
  'USD',
  '{"appName":"ServicePro","primaryColor":"#1f4f82","logoUrl":"","portalWelcomeTitle":"Welcome to your service portal","portalWelcomeMessage":"Request service, review estimates, and view invoices."}'::jsonb,
  '{"customerPortal":true,"estimates":true,"invoices":true,"payments":true,"inventory":true,"dispatch":true,"notifications":true,"reports":true,"exports":true,"audit":true}'::jsonb
)
ON CONFLICT (tenant_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS tenant_setting_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  actor_id text NOT NULL DEFAULT '',
  event_type text NOT NULL DEFAULT 'tenant.settings.updated',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_setting_events_tenant_time
ON tenant_setting_events (tenant_id, created_at DESC);
