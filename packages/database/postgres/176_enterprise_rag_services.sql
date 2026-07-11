-- Sprint 176: Enterprise RAG Services
CREATE TABLE IF NOT EXISTS phase10_176_enterprise_rag_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  owner text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_phase10_176_enterprise_rag_services_tenant_status ON phase10_176_enterprise_rag_services (tenant_id, status);
