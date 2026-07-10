const { makeId, now } = require('../services/id');
const { validateStockAdjustment } = require('../services/inventoryService');

function createStockAdjustmentRepository(store) {
  if (store.type === 'json') return createJsonStockAdjustmentRepository(store);
  if (store.type === 'postgres') return createPostgresStockAdjustmentRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureAdjustments(data) {
  if (!data.stockAdjustments) data.stockAdjustments = [];
  return data;
}

function createJsonStockAdjustmentRepository(store) {
  return {
    list(tenantId) {
      return ensureAdjustments(store.read()).stockAdjustments.filter(a => a.tenantId === tenantId);
    },
    create(tenantId, input) {
      validateStockAdjustment(input);
      const data = ensureAdjustments(store.read());
      const adjustment = {
        id: makeId('adj'),
        tenantId,
        inventoryItemId: input.inventoryItemId,
        quantityDelta: Number(input.quantityDelta),
        reason: input.reason || 'manual_adjustment',
        reference: input.reference || '',
        createdAt: now()
      };
      data.stockAdjustments.push(adjustment);
      store.write(data);
      return adjustment;
    }
  };
}

function createPostgresStockAdjustmentRepository(store) {
  return {
    async list(tenantId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", inventory_item_id::text as "inventoryItemId",
                quantity_delta::float as "quantityDelta", reason, reference, created_at as "createdAt"
         FROM stock_adjustments WHERE tenant_id = $1 ORDER BY created_at DESC`,
        [tenantId]
      );
      return result.rows;
    },
    async create(tenantId, input) {
      validateStockAdjustment(input);
      const result = await store.query(
        `INSERT INTO stock_adjustments (tenant_id, inventory_item_id, quantity_delta, reason, reference)
         VALUES ($1, $2::uuid, $3, $4, $5)
         RETURNING id::text, tenant_id as "tenantId", inventory_item_id::text as "inventoryItemId",
                   quantity_delta::float as "quantityDelta", reason, reference, created_at as "createdAt"`,
        [tenantId, input.inventoryItemId, Number(input.quantityDelta), input.reason || 'manual_adjustment', input.reference || '']
      );
      return result.rows[0];
    }
  };
}

module.exports = { createStockAdjustmentRepository };
