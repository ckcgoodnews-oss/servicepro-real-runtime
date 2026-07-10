CREATE TABLE IF NOT EXISTS ai_knowledge_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  source_type text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  storage_key text,
  source_url text,
  manufacturer text,
  equipment_type text,
  language_code text NOT NULL DEFAULT 'en',
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_document_ingestion_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  knowledge_source_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  parser_type text NOT NULL DEFAULT 'auto',
  chunking_strategy text NOT NULL DEFAULT 'recursive',
  total_pages integer NOT NULL DEFAULT 0,
  total_chunks integer NOT NULL DEFAULT 0,
  chunks_embedded integer NOT NULL DEFAULT 0,
  error_message text NOT NULL DEFAULT '',
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  knowledge_source_id uuid NOT NULL,
  ingestion_job_id uuid,
  chunk_index integer NOT NULL,
  page_start integer,
  page_end integer,
  section_title text,
  content_text text NOT NULL,
  token_count integer NOT NULL DEFAULT 0,
  content_hash text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_embedding_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  document_chunk_id uuid NOT NULL,
  embedding_provider text NOT NULL,
  embedding_model text NOT NULL,
  vector_store text NOT NULL DEFAULT 'postgres',
  vector_reference text,
  embedding_dimension integer,
  status text NOT NULL DEFAULT 'ready',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, document_chunk_id, embedding_provider, embedding_model)
);

CREATE TABLE IF NOT EXISTS ai_semantic_search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid,
  query_text text NOT NULL,
  query_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_count integer NOT NULL DEFAULT 0,
  latency_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_troubleshooting_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  job_id uuid,
  technician_id uuid,
  equipment_id uuid,
  problem_summary text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

CREATE TABLE IF NOT EXISTS ai_troubleshooting_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  session_id uuid NOT NULL,
  sender_type text NOT NULL,
  message_text text NOT NULL,
  cited_chunk_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  safety_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_estimate_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  job_id uuid,
  customer_id uuid,
  prompt_summary text NOT NULL DEFAULT '',
  recommended_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_total numeric(12,2) NOT NULL DEFAULT 0,
  confidence numeric(6,4),
  status text NOT NULL DEFAULT 'draft',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_answer_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid,
  assistant_type text NOT NULL,
  input_text text NOT NULL DEFAULT '',
  output_text text NOT NULL DEFAULT '',
  cited_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  safety_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  model_name text,
  provider text,
  latency_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
