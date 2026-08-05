-- ServicePRO Security Audit - Check RLS Status on All Tables
-- Run this to identify tables that need RLS enabled

-- =============================================================================
-- 1. CHECK CURRENT RLS STATUS
-- =============================================================================

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✓ SECURE' 
        ELSE '❌ VULNERABLE' 
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
ORDER BY rowsecurity, tablename;

-- =============================================================================
-- 2. FIND TABLES WITH TENANT_ID COLUMN (should have RLS)
-- =============================================================================

SELECT 
    t.table_name,
    CASE WHEN pt.rowsecurity THEN '✓ RLS Enabled' ELSE '❌ RLS Missing' END as rls_status,
    CASE WHEN p.policyname IS NOT NULL THEN '✓ Has Policies' ELSE '❌ No Policies' END as policy_status
FROM information_schema.tables t
LEFT JOIN pg_tables pt ON pt.tablename = t.table_name AND pt.schemaname = 'public'
LEFT JOIN information_schema.columns c ON c.table_name = t.table_name AND c.column_name = 'tenant_id'
LEFT JOIN pg_policies p ON p.tablename = t.table_name AND p.policyname = 'tenant_isolation'
WHERE t.table_schema = 'public' 
    AND c.column_name = 'tenant_id'
    AND t.table_type = 'BASE TABLE'
ORDER BY pt.rowsecurity, t.table_name;

-- =============================================================================
-- 3. CHECK FOR EXISTING RLS POLICIES
-- =============================================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================================================
-- 4. GENERATE RLS ENABLE COMMANDS FOR MISSING TABLES
-- =============================================================================

SELECT 
    'ALTER TABLE ' || table_name || ' ENABLE ROW LEVEL SECURITY;' as enable_rls_command,
    'CREATE POLICY "tenant_isolation" ON ' || table_name || ' FOR ALL USING (tenant_id = current_tenant());' as create_policy_command,
    'CREATE POLICY "service_role_bypass" ON ' || table_name || ' FOR ALL TO service_role USING (true);' as service_bypass_command
FROM information_schema.tables t
LEFT JOIN pg_tables pt ON pt.tablename = t.table_name AND pt.schemaname = 'public'
LEFT JOIN information_schema.columns c ON c.table_name = t.table_name AND c.column_name = 'tenant_id'
WHERE t.table_schema = 'public' 
    AND c.column_name = 'tenant_id'
    AND t.table_type = 'BASE TABLE'
    AND (pt.rowsecurity IS NULL OR pt.rowsecurity = false)
ORDER BY t.table_name;

-- =============================================================================
-- 5. CHECK CURRENT TENANT FUNCTION
-- =============================================================================

SELECT 
    routine_name,
    routine_type,
    security_type,
    CASE 
        WHEN routine_name = 'current_tenant' THEN '✓ Function exists'
        ELSE '❌ Function missing'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name = 'current_tenant';

-- =============================================================================
-- 6. TEST TENANT ISOLATION (after setting tenant)
-- =============================================================================

-- Uncomment and run these after applying RLS:

-- Test 1: Set tenant and verify function works
-- SET app.current_tenant = 'test_tenant_123';
-- SELECT current_tenant(); -- should return 'test_tenant_123'

-- Test 2: Try to access data without tenant set
-- RESET app.current_tenant;
-- SELECT current_tenant(); -- should return 'no_tenant' 
-- SELECT COUNT(*) FROM deals; -- should return 0 or error

-- Test 3: Verify tenant isolation
-- SET app.current_tenant = 'tenant_a';
-- SELECT COUNT(*) as tenant_a_deals FROM deals;
-- SET app.current_tenant = 'tenant_b'; 
-- SELECT COUNT(*) as tenant_b_deals FROM deals;
-- -- Counts should be different and isolated

-- =============================================================================
-- 7. SECURITY RECOMMENDATIONS
-- =============================================================================

SELECT 'CRITICAL SECURITY ISSUES FOUND:' as alert_type, COUNT(*) as count
FROM information_schema.tables t
LEFT JOIN pg_tables pt ON pt.tablename = t.table_name AND pt.schemaname = 'public'
LEFT JOIN information_schema.columns c ON c.table_name = t.table_name AND c.column_name = 'tenant_id'
WHERE t.table_schema = 'public' 
    AND c.column_name = 'tenant_id'
    AND t.table_type = 'BASE TABLE'
    AND (pt.rowsecurity IS NULL OR pt.rowsecurity = false);

-- Next steps:
-- 1. Apply migration 781_enable_rls_security.sql IMMEDIATELY
-- 2. Run this audit script to find any missed tables
-- 3. Add RLS to any additional tables found
-- 4. Test your application with RLS enabled
-- 5. Monitor logs for RLS policy violations