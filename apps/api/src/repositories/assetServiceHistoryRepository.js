const { makeId, now } = require('../services/id');
const { normalizeAssetServiceEvent } = require('../services/customerAssetService');

function createAssetServiceHistoryRepository(store) {
  if (store.type === 'json') return createJsonAssetServiceHistoryRepository(store);
  if (store.type === 'postgres') return createPostgresAssetServiceHistoryRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureHistory(data) {
  if (!data.assetServiceHistory) data.assetServiceHistory = [];
  return data;
}

function createJsonAssetServiceHistoryRepository(store) {
  return {
    listForAsset(tenantId, assetId) {
      return ensureHistory(store.read()).assetServiceHistory.filter(x => x.tenantId === tenantId && x.assetId === assetId);
    },
    create(tenantId, input) {
      const data = ensureHistory(store.read());
      const event = { id: makeId('assethist'), tenantId, ...normalizeAssetServiceEvent(input), createdAt: now(), updatedAt: now() };
      data.assetServiceHistory.push(event);
      store.write(data);
      return event;
    }
  };
}

function createPostgresAssetServiceHistoryRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", asset_id::text as "assetId",
    job_id::text as "jobId", service_date as "serviceDate", event_type as "eventType",
    summary, technician_id::text as "technicianId", notes, metadata,
    created_at as "createdAt", updated_at as "updatedAt"
    FROM asset_service_history`;
  return {
    async listForAsset(tenantId, assetId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND asset_id = $2 ORDER BY service_date DESC`, [tenantId, assetId]);
      return result.rows;
    },
    async create(tenantId, input) {
      const x = normalizeAssetServiceEvent(input);
      const result = await store.query(
        `INSERT INTO asset_service_history
         (tenant_id, asset_id, job_id, service_date, event_type, summary, technician_id, notes, metadata)
         VALUES ($1, $2::uuid, NULLIF($3, '')::uuid, $4::date, $5, $6, NULLIF($7, '')::uuid, $8, $9::jsonb)
         RETURNING id::text, tenant_id as "tenantId", asset_id::text as "assetId",
                   job_id::text as "jobId", service_date as "serviceDate", event_type as "eventType",
                   summary, technician_id::text as "technicianId", notes, metadata,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.assetId, x.jobId, x.serviceDate, x.eventType, x.summary, x.technicianId, x.notes, JSON.stringify(x.metadata || {})]
      );
      return result.rows[0];
    }
  };
}

module.exports = { createAssetServiceHistoryRepository };
