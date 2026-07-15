-- Sprint 720: self-service user profiles, preferences, MFA state, and API tokens.
ALTER TABLE runtime_users ADD COLUMN IF NOT EXISTS avatar_url text NOT NULL DEFAULT '';
ALTER TABLE runtime_users ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'America/Indiana/Indianapolis';
ALTER TABLE runtime_users ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'en-US';
ALTER TABLE runtime_users ADD COLUMN IF NOT EXISTS notification_preferences jsonb NOT NULL DEFAULT '{"email":true,"push":true,"dispatch":true,"billing":true,"product":false}'::jsonb;

CREATE TABLE IF NOT EXISTS runtime_user_api_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, user_id uuid NOT NULL,
  name text NOT NULL, token_hash text NOT NULL UNIQUE, last_four text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), last_used_at timestamptz,
  expires_at timestamptz, revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_runtime_user_api_tokens_user ON runtime_user_api_tokens (tenant_id,user_id) WHERE revoked_at IS NULL;
