-- Trial marketplace selections and generated sites
-- Extends the trial system with offering selection and site provisioning

CREATE TABLE IF NOT EXISTS trial_site_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID NOT NULL REFERENCES trials(id),
  tenant_id TEXT NOT NULL,
  offering_id TEXT NOT NULL,
  offering_snapshot JSONB NOT NULL DEFAULT '{}',
  sequence INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trial_selections_trial ON trial_site_selections (trial_id);
CREATE INDEX IF NOT EXISTS idx_trial_selections_tenant ON trial_site_selections (tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_trial_selections_unique ON trial_site_selections (trial_id, offering_id);

CREATE TABLE IF NOT EXISTS trial_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id UUID NOT NULL REFERENCES trials(id),
  tenant_id TEXT NOT NULL,
  public_slug TEXT NOT NULL,
  provisioning_state TEXT DEFAULT 'pending',
  site_content JSONB NOT NULL DEFAULT '{}',
  field_states JSONB NOT NULL DEFAULT '{}',
  published_at TIMESTAMPTZ,
  provisioned_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT DEFAULT '',
  retry_count INT DEFAULT 0,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trial_sites_trial ON trial_sites (trial_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_trial_sites_slug ON trial_sites (public_slug);
CREATE INDEX IF NOT EXISTS idx_trial_sites_tenant ON trial_sites (tenant_id);
CREATE INDEX IF NOT EXISTS idx_trial_sites_state ON trial_sites (provisioning_state);

-- Add trial_site_id reference to trials table
ALTER TABLE trials ADD COLUMN IF NOT EXISTS trial_site_id UUID;
ALTER TABLE trials ADD COLUMN IF NOT EXISTS selections_confirmed_at TIMESTAMPTZ;
