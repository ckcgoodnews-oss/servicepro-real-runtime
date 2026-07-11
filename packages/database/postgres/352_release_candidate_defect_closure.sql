-- Sprint 352: Release Candidate Defect Closure
CREATE TABLE IF NOT EXISTS phase21_352_release_candidate_defect_closure (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  gate_required boolean NOT NULL DEFAULT true,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase21_352_release_candidate_defect_closure_tenant_status ON phase21_352_release_candidate_defect_closure (tenant_id, status);
