-- Sprint 111 PostgreSQL migration: document and e-signature runtime.

CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  document_type text NOT NULL DEFAULT 'contract',
  body text NOT NULL,
  required_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_packets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  template_id uuid NOT NULL,
  related_type text NOT NULL DEFAULT '',
  related_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  merge_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_body text NOT NULL DEFAULT '',
  generated_at timestamptz,
  approved_at timestamptz,
  completed_at timestamptz,
  document_url text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  packet_id uuid NOT NULL,
  approver_id text NOT NULL,
  approver_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL,
  responded_at timestamptz,
  comments text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS signature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  packet_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  provider text NOT NULL DEFAULT 'internal',
  external_envelope_id text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  sent_at timestamptz,
  completed_at timestamptz,
  declined_at timestamptz,
  voided_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS signature_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signature_request_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'signer',
  routing_order integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamptz,
  viewed_at timestamptz,
  signed_at timestamptz,
  declined_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  packet_id uuid NOT NULL,
  signature_request_id uuid,
  event_type text NOT NULL,
  actor_id text NOT NULL DEFAULT '',
  actor_name text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  occurred_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_templates_status_type ON document_templates (status, document_type, name);
CREATE INDEX IF NOT EXISTS idx_document_packets_tenant_status ON document_packets (tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_approvals_packet_status ON document_approvals (packet_id, status);
CREATE INDEX IF NOT EXISTS idx_signature_requests_packet_status ON signature_requests (packet_id, status);
CREATE INDEX IF NOT EXISTS idx_signature_recipients_request_status ON signature_recipients (signature_request_id, status, routing_order);
CREATE INDEX IF NOT EXISTS idx_document_audit_packet ON document_audit_events (packet_id, occurred_at);
