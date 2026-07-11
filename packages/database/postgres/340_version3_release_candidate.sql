-- Sprint 340: Version3 Release Candidate
CREATE TABLE IF NOT EXISTS phase20_340_version3_release_candidate (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase20_340_version3_release_candidate_tenant_status ON phase20_340_version3_release_candidate (tenant_id, status);
