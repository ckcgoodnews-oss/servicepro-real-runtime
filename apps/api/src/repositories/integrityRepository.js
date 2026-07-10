const { makeId, now } = require('../services/id');
const { runJsonIntegrityChecks } = require('../services/integrityService');

function createIntegrityRepository(store) {
  if (store.type === 'json') return createJsonIntegrityRepository(store);
  if (store.type === 'postgres') return createPostgresIntegrityRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureIntegrity(data) {
  if (!data.integrityRuns) data.integrityRuns = [];
  return data;
}

function createJsonIntegrityRepository(store) {
  return {
    list(tenantId) {
      return ensureIntegrity(store.read()).integrityRuns.filter(x => x.tenantId === tenantId).reverse();
    },
    run(tenantId) {
      const data = ensureIntegrity(store.read());
      const result = runJsonIntegrityChecks(data, tenantId);
      const record = {
        id: makeId('integrity'),
        tenantId,
        status: result.status,
        issueCount: result.issueCount,
        issues: result.issues,
        createdAt: now()
      };
      data.integrityRuns.push(record);
      store.write(data);
      return record;
    }
  };
}

function createPostgresIntegrityRepository(store) {
  return {
    async list(tenantId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", status, issue_count as "issueCount",
                issues, created_at as "createdAt"
         FROM integrity_check_runs
         WHERE tenant_id = $1
         ORDER BY created_at DESC`,
        [tenantId]
      );
      return result.rows;
    },
    async run(tenantId) {
      const checks = await store.query(
        `SELECT 'negative_invoice_balance' as code, id::text as entity_id, 'invoice' as entity_type
         FROM invoices WHERE tenant_id = $1 AND balance_due < 0
         UNION ALL
         SELECT 'negative_inventory' as code, id::text as entity_id, 'inventory' as entity_type
         FROM inventory_items WHERE tenant_id = $1 AND quantity_on_hand < 0`,
        [tenantId]
      );

      const issues = checks.rows.map(row => ({
        code: row.code,
        entityType: row.entity_type,
        entityId: row.entity_id,
        message: row.code
      }));

      const status = issues.length ? 'failed' : 'passed';
      const result = await store.query(
        `INSERT INTO integrity_check_runs (tenant_id, status, issue_count, issues)
         VALUES ($1, $2, $3, $4::jsonb)
         RETURNING id::text, tenant_id as "tenantId", status, issue_count as "issueCount",
                   issues, created_at as "createdAt"`,
        [tenantId, status, issues.length, JSON.stringify(issues)]
      );

      return result.rows[0];
    }
  };
}

module.exports = { createIntegrityRepository };
