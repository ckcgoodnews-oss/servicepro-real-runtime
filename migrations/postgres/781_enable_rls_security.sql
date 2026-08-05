-- Migration 781: CRITICAL SECURITY — Enable Row Level Security on ALL existing tables
-- ServicePRO v8.0 | Tenant isolation via app.current_tenant session variable
--
-- The Node.js API sets this variable per-connection before every query:
--   SELECT set_config('app.current_tenant', tenantId, true)
--
-- Idempotent: safe to run multiple times.
--
-- NOTE: Some tables use tenant_id as UUID, others as TEXT.
-- We cast tenant_id::text in all policies to handle both cases.

-- =============================================================================
-- HELPER FUNCTION: safe current_tenant getter (returns TEXT)
-- =============================================================================

CREATE OR REPLACE FUNCTION app_current_tenant()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(nullif(current_setting('app.current_tenant', true), ''), '__no_tenant__')
$$;

-- =============================================================================
-- CATCH-ALL: Enable RLS on EVERY table with a tenant_id column.
-- Uses tenant_id::text cast so it works for both UUID and TEXT columns.
-- Uses FORCE so RLS applies even when connected as the table owner (postgres role).
-- =============================================================================

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT c.table_name
    FROM information_schema.columns c
    JOIN pg_tables pt ON pt.tablename = c.table_name AND pt.schemaname = 'public'
    WHERE c.table_schema = 'public'
      AND c.column_name = 'tenant_id'
  LOOP
    -- Enable and force RLS (idempotent — no-op if already enabled)
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', rec.table_name);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', rec.table_name);

    -- Create policy if it doesn't exist yet
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = rec.table_name AND policyname = 'tenant_isolation'
    ) THEN
      EXECUTE format(
        'CREATE POLICY tenant_isolation ON %I FOR ALL USING (tenant_id::text = app_current_tenant())',
        rec.table_name
      );
    END IF;

    RAISE NOTICE 'RLS enabled + forced on: %', rec.table_name;
  END LOOP;
END $$;

-- =============================================================================
-- VERIFICATION (uncomment and run separately after success):
-- =============================================================================

-- SELECT c.table_name, pt.rowsecurity, pt.forcerowsecurity
-- FROM information_schema.columns c
-- JOIN pg_tables pt ON pt.tablename = c.table_name AND pt.schemaname = 'public'
-- WHERE c.table_schema = 'public' AND c.column_name = 'tenant_id'
-- ORDER BY c.table_name;