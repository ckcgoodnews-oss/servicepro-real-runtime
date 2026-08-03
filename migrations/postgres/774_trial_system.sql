-- Trial system tables
-- Supports self-service trial registration, onboarding tracking, and conversion

CREATE TABLE IF NOT EXISTS trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  company_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  country TEXT DEFAULT '',
  timezone TEXT DEFAULT '',
  industry TEXT DEFAULT '',
  team_size TEXT DEFAULT '',
  plan TEXT DEFAULT 'professional',
  status TEXT DEFAULT 'pending_verification',
  verification_token_hash TEXT DEFAULT '',
  email_verified_at TIMESTAMPTZ,
  provisioned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  source TEXT DEFAULT '',
  campaign TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trials_email ON trials (email);
CREATE INDEX IF NOT EXISTS idx_trials_tenant_id ON trials (tenant_id);
CREATE INDEX IF NOT EXISTS idx_trials_status ON trials (status);

CREATE TABLE IF NOT EXISTS trial_onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  user_id TEXT DEFAULT '',
  step_key TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sequence INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, step_key)
);

CREATE INDEX IF NOT EXISTS idx_trial_onboarding_tenant ON trial_onboarding_steps (tenant_id);
