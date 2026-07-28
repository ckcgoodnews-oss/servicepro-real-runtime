-- Reconcile legacy tenant-scoped records into the canonical workspace registry.
-- Some pre-registry owner accounts and tenant settings were created before every
-- tenant was guaranteed a row in tenants. Preserve their stable tenant IDs.

WITH tenant_candidates AS (
  SELECT
    ts.tenant_id AS tenant_key,
    COALESCE(NULLIF(ts.company_name, ''), ts.tenant_id) AS name,
    1 AS priority
  FROM tenant_settings ts
  WHERE NULLIF(BTRIM(ts.tenant_id), '') IS NOT NULL

  UNION ALL

  SELECT
    u.tenant_id AS tenant_key,
    COALESCE(NULLIF(MAX(u.name), ''), NULLIF(MAX(u.email), ''), u.tenant_id) AS name,
    2 AS priority
  FROM runtime_users u
  WHERE NULLIF(BTRIM(u.tenant_id), '') IS NOT NULL
    AND u.roles ? 'owner'
  GROUP BY u.tenant_id
),
canonical_candidates AS (
  SELECT DISTINCT ON (tenant_key)
    tenant_key,
    name
  FROM tenant_candidates
  ORDER BY tenant_key, priority, name
)
INSERT INTO tenants (tenant_key, name)
SELECT tenant_key, name
FROM canonical_candidates
ON CONFLICT (tenant_key) DO UPDATE
SET name = CASE
  WHEN tenants.name = tenants.tenant_key OR NULLIF(BTRIM(tenants.name), '') IS NULL
    THEN EXCLUDED.name
  ELSE tenants.name
END;
