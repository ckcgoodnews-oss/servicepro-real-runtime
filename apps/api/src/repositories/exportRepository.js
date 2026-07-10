const { makeId, now } = require('../services/id');

function createExportRepository(store) {
  if (store.type === 'json') return createJsonExportRepository(store);
  if (store.type === 'postgres') return createPostgresExportRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureExports(data) {
  if (!data.exportRuns) data.exportRuns = [];
  return data;
}

function createJsonExportRepository(store) {
  return {
    list(tenantId) {
      return ensureExports(store.read()).exportRuns.filter(x => x.tenantId === tenantId);
    },
    create(tenantId, input) {
      const data = ensureExports(store.read());
      const run = {
        id: makeId('export'),
        tenantId,
        exportKey: input.exportKey,
        filename: input.filename,
        rowCount: Number(input.rowCount || 0),
        status: input.status || 'success',
        createdBy: input.createdBy || '',
        createdAt: now()
      };
      data.exportRuns.push(run);
      store.write(data);
      return run;
    }
  };
}

function createPostgresExportRepository(store) {
  return {
    async list(tenantId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", export_key as "exportKey", filename,
                row_count as "rowCount", status, created_by as "createdBy", created_at as "createdAt"
         FROM export_runs WHERE tenant_id = $1 ORDER BY created_at DESC`,
        [tenantId]
      );
      return result.rows;
    },
    async create(tenantId, input) {
      const result = await store.query(
        `INSERT INTO export_runs (tenant_id, export_key, filename, row_count, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id::text, tenant_id as "tenantId", export_key as "exportKey", filename,
                   row_count as "rowCount", status, created_by as "createdBy", created_at as "createdAt"`,
        [tenantId, input.exportKey, input.filename, Number(input.rowCount || 0), input.status || 'success', input.createdBy || '']
      );
      return result.rows[0];
    }
  };
}

module.exports = { createExportRepository };
