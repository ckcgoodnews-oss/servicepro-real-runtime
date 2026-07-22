CREATE TABLE IF NOT EXISTS runtime_owner_access_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES runtime_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  token_last_four text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','suspended','revoked')),
  expires_at timestamptz NOT NULL,
  activated_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_owner_access_user
ON runtime_owner_access_entitlements (tenant_id, user_id, created_at DESC);
