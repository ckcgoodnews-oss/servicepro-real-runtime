-- Sprint 717: revocable browser sessions, recovery, invitations, and MFA challenges.
ALTER TABLE runtime_users ADD COLUMN IF NOT EXISTS mfa_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE runtime_auth_sessions ADD COLUMN IF NOT EXISTS refresh_token_hash text;
ALTER TABLE runtime_auth_sessions ADD COLUMN IF NOT EXISTS user_agent text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_runtime_auth_sessions_refresh ON runtime_auth_sessions (refresh_token_hash) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS runtime_password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, user_id uuid NOT NULL,
  token_hash text NOT NULL, expires_at timestamptz NOT NULL, used_at timestamptz, revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS runtime_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, user_id uuid NOT NULL,
  email text NOT NULL, name text NOT NULL DEFAULT '', token_hash text NOT NULL, expires_at timestamptz NOT NULL,
  used_at timestamptz, revoked_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS runtime_mfa_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, user_id uuid NOT NULL,
  challenge_hash text NOT NULL, expires_at timestamptz NOT NULL, used_at timestamptz, revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_runtime_password_reset_lookup ON runtime_password_reset_tokens (tenant_id, token_hash);
CREATE INDEX IF NOT EXISTS idx_runtime_invitation_lookup ON runtime_invitations (tenant_id, token_hash);
CREATE INDEX IF NOT EXISTS idx_runtime_mfa_challenge_lookup ON runtime_mfa_challenges (tenant_id, id);
