const { makeId, now } = require('../services/id');
const { validateMaterialUsage } = require('../services/inventoryService');

function createMaterialUsageRepository(store) {
  if (store.type === 'json') return createJsonMaterialUsageRepository(store);
  if (store.type === 'postgres') return createPostgresMaterialUsageRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureUsage(data) {
  if (!data.materialUsage) data.materialUsage = [];
  return data;
}

function createJsonMaterialUsageRepository(store) {
  return {
    list(tenantId) {
      return ensureUsage(store.read()).materialUsage.filter(u => u.tenantId === tenantId);
    },
    listForJob(tenantId, jobId) {
      return ensureUsage(store.read()).materialUsage.filter(u => u.tenantId === tenantId && u.jobId === jobId);
    },
    create(tenantId, input) {
      validateMaterialUsage(input);
      const data = ensureUsage(store.read());
      const usage = {
        id: makeId('mat'),
        tenantId,
        jobId: input.jobId,
        inventoryItemId: input.inventoryItemId,
        quantity: Number(input.quantity),
        unitCost: Number(input.unitCost || 0),
        notes: input.notes || '',
        usedAt: input.usedAt || now(),
        createdAt: now()
      };
      data.materialUsage.push(usage);
      store.write(data);
      return usage;
    }
  };
}

function createPostgresMaterialUsageRepository(store) {
  return {
    async list(tenantId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", job_id::text as "jobId", inventory_item_id::text as "inventoryItemId",
                quantity::float, unit_cost::float as "unitCost", notes, used_at as "usedAt", created_at as "createdAt"
         FROM job_material_usage WHERE tenant_id = $1 ORDER BY used_at DESC`,
        [tenantId]
      );
      return result.rows;
    },
    async listForJob(tenantId, jobId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", job_id::text as "jobId", inventory_item_id::text as "inventoryItemId",
                quantity::float, unit_cost::float as "unitCost", notes, used_at as "usedAt", created_at as "createdAt"
         FROM job_material_usage WHERE tenant_id = $1 AND job_id = $2 ORDER BY used_at DESC`,
        [tenantId, jobId]
      );
      return result.rows;
    },
    async create(tenantId, input) {
      validateMaterialUsage(input);
      const result = await store.query(
        `INSERT INTO job_material_usage (tenant_id, job_id, inventory_item_id, quantity, unit_cost, notes, used_at)
         VALUES ($1, $2::uuid, $3::uuid, $4, $5, $6, COALESCE($7::timestamptz, now()))
         RETURNING id::text, tenant_id as "tenantId", job_id::text as "jobId", inventory_item_id::text as "inventoryItemId",
                   quantity::float, unit_cost::float as "unitCost", notes, used_at as "usedAt", created_at as "createdAt"`,
        [tenantId, input.jobId, input.inventoryItemId, Number(input.quantity), Number(input.unitCost || 0), input.notes || '', input.usedAt || null]
      );
      return result.rows[0];
    }
  };
}

module.exports = { createMaterialUsageRepository };
