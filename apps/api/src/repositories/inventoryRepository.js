const { makeId, now } = require('../services/id');
const { requireFields } = require('../utils/validation');
const { applyStockDelta, roundQuantity } = require('../services/inventoryService');

function createInventoryRepository(store) {
  if (store.type === 'json') return createJsonInventoryRepository(store);
  if (store.type === 'postgres') return createPostgresInventoryRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureInventory(data) {
  if (!data.inventoryItems) data.inventoryItems = [];
  return data;
}

function createJsonInventoryRepository(store) {
  return {
    list(tenantId) {
      return ensureInventory(store.read()).inventoryItems.filter(i => i.tenantId === tenantId && i.active !== false);
    },
    findById(tenantId, id) {
      return ensureInventory(store.read()).inventoryItems.find(i => i.tenantId === tenantId && i.id === id) || null;
    },
    create(tenantId, input) {
      requireFields(input, ['sku', 'name']);
      const data = ensureInventory(store.read());
      if (data.inventoryItems.some(i => i.tenantId === tenantId && i.sku === input.sku)) {
        const err = new Error(`Inventory SKU already exists: ${input.sku}`);
        err.status = 409;
        err.code = 'conflict';
        throw err;
      }
      const item = {
        id: makeId('item'),
        tenantId,
        sku: input.sku,
        name: input.name,
        description: input.description || '',
        category: input.category || 'parts',
        unitCost: Number(input.unitCost || 0),
        unitPrice: Number(input.unitPrice || 0),
        quantityOnHand: roundQuantity(input.quantityOnHand || 0),
        reorderPoint: roundQuantity(input.reorderPoint || 0),
        active: input.active !== false,
        createdAt: now(),
        updatedAt: now()
      };
      data.inventoryItems.push(item);
      store.write(data);
      return item;
    },
    update(tenantId, id, input) {
      const data = ensureInventory(store.read());
      const idx = data.inventoryItems.findIndex(i => i.tenantId === tenantId && i.id === id);
      if (idx === -1) return null;
      data.inventoryItems[idx] = {
        ...data.inventoryItems[idx],
        ...input,
        id,
        tenantId,
        unitCost: input.unitCost !== undefined ? Number(input.unitCost) : data.inventoryItems[idx].unitCost,
        unitPrice: input.unitPrice !== undefined ? Number(input.unitPrice) : data.inventoryItems[idx].unitPrice,
        quantityOnHand: input.quantityOnHand !== undefined ? roundQuantity(input.quantityOnHand) : data.inventoryItems[idx].quantityOnHand,
        reorderPoint: input.reorderPoint !== undefined ? roundQuantity(input.reorderPoint) : data.inventoryItems[idx].reorderPoint,
        updatedAt: now()
      };
      store.write(data);
      return data.inventoryItems[idx];
    },
    adjustQuantity(tenantId, id, delta) {
      const data = ensureInventory(store.read());
      const idx = data.inventoryItems.findIndex(i => i.tenantId === tenantId && i.id === id);
      if (idx === -1) return null;
      data.inventoryItems[idx] = applyStockDelta(data.inventoryItems[idx], delta);
      store.write(data);
      return data.inventoryItems[idx];
    },
    delete(tenantId, id) {
      const data = ensureInventory(store.read());
      const idx = data.inventoryItems.findIndex(i => i.tenantId === tenantId && i.id === id);
      if (idx === -1) return false;
      data.inventoryItems[idx].active = false;
      data.inventoryItems[idx].updatedAt = now();
      store.write(data);
      return true;
    }
  };
}

function createPostgresInventoryRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", sku, name, description, category,
    unit_cost::float as "unitCost", unit_price::float as "unitPrice",
    quantity_on_hand::float as "quantityOnHand", reorder_point::float as "reorderPoint",
    active, created_at as "createdAt", updated_at as "updatedAt" FROM inventory_items`;

  return {
    async list(tenantId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND active = true ORDER BY category, name`, [tenantId]);
      return result.rows;
    },
    async findById(tenantId, id) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      requireFields(input, ['sku', 'name']);
      const result = await store.query(
        `INSERT INTO inventory_items (tenant_id, sku, name, description, category, unit_cost, unit_price, quantity_on_hand, reorder_point, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id::text, tenant_id as "tenantId", sku, name, description, category,
                   unit_cost::float as "unitCost", unit_price::float as "unitPrice",
                   quantity_on_hand::float as "quantityOnHand", reorder_point::float as "reorderPoint",
                   active, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.sku, input.name, input.description || '', input.category || 'parts', Number(input.unitCost || 0), Number(input.unitPrice || 0), Number(input.quantityOnHand || 0), Number(input.reorderPoint || 0), input.active !== false]
      );
      return result.rows[0];
    },
    async update(tenantId, id, input) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const next = { ...existing, ...input };
      const result = await store.query(
        `UPDATE inventory_items
         SET sku = $3, name = $4, description = $5, category = $6, unit_cost = $7, unit_price = $8,
             quantity_on_hand = $9, reorder_point = $10, active = $11, updated_at = now()
         WHERE tenant_id = $1 AND id = $2
         RETURNING id::text, tenant_id as "tenantId", sku, name, description, category,
                   unit_cost::float as "unitCost", unit_price::float as "unitPrice",
                   quantity_on_hand::float as "quantityOnHand", reorder_point::float as "reorderPoint",
                   active, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, next.sku, next.name, next.description || '', next.category || 'parts', Number(next.unitCost || 0), Number(next.unitPrice || 0), Number(next.quantityOnHand || 0), Number(next.reorderPoint || 0), next.active !== false]
      );
      return result.rows[0] || null;
    },
    async adjustQuantity(tenantId, id, delta) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const next = applyStockDelta(existing, delta);
      const result = await store.query(
        `UPDATE inventory_items
         SET quantity_on_hand = $3, updated_at = now()
         WHERE tenant_id = $1 AND id = $2
         RETURNING id::text, tenant_id as "tenantId", sku, name, description, category,
                   unit_cost::float as "unitCost", unit_price::float as "unitPrice",
                   quantity_on_hand::float as "quantityOnHand", reorder_point::float as "reorderPoint",
                   active, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, next.quantityOnHand]
      );
      return result.rows[0] || null;
    },
    async delete(tenantId, id) {
      const result = await store.query('UPDATE inventory_items SET active = false, updated_at = now() WHERE tenant_id = $1 AND id = $2', [tenantId, id]);
      return result.rowCount > 0;
    }
  };
}

module.exports = { createInventoryRepository };
