const { makeId, now } = require('../services/id');
const { normalizeWarehouseInput, normalizeBinInput } = require('../services/warehouseService');

function createWarehouseRepository(store) {
  if (store.type === 'json') return createJsonWarehouseRepository(store);
  if (store.type === 'postgres') return createPostgresWarehouseRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureWarehouses(data) {
  if (!data.warehouses) data.warehouses = [];
  if (!data.warehouseBins) data.warehouseBins = [];
  return data;
}

function createJsonWarehouseRepository(store) {
  return {
    list(tenantId) {
      return ensureWarehouses(store.read()).warehouses.filter(x => x.tenantId === tenantId);
    },
    findById(tenantId, id) {
      return this.list(tenantId).find(x => x.id === id) || null;
    },
    create(tenantId, input) {
      const data = ensureWarehouses(store.read());
      const warehouse = { id: makeId('wh'), tenantId, ...normalizeWarehouseInput(input), createdAt: now(), updatedAt: now() };
      data.warehouses.push(warehouse);
      store.write(data);
      return warehouse;
    },
    update(tenantId, id, input) {
      const data = ensureWarehouses(store.read());
      const idx = data.warehouses.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.warehouses[idx] = { ...data.warehouses[idx], ...input, id, tenantId, updatedAt: now() };
      store.write(data);
      return data.warehouses[idx];
    },
    listBins(tenantId, warehouseId) {
      return ensureWarehouses(store.read()).warehouseBins.filter(x => x.tenantId === tenantId && (!warehouseId || x.warehouseId === warehouseId));
    },
    createBin(tenantId, input) {
      const data = ensureWarehouses(store.read());
      const bin = { id: makeId('bin'), tenantId, ...normalizeBinInput(input), createdAt: now(), updatedAt: now() };
      data.warehouseBins.push(bin);
      store.write(data);
      return bin;
    }
  };
}

function createPostgresWarehouseRepository(store) {
  const warehouseSelect = `SELECT id::text, tenant_id as "tenantId", code, name, description,
    warehouse_type as "warehouseType", address1, address2, city, state, postal_code as "postalCode",
    country, active, notes, created_at as "createdAt", updated_at as "updatedAt" FROM warehouses`;
  const binSelect = `SELECT id::text, tenant_id as "tenantId", warehouse_id::text as "warehouseId",
    code, name, description, active, sort_order as "sortOrder", created_at as "createdAt",
    updated_at as "updatedAt" FROM warehouse_bins`;

  return {
    async list(tenantId) {
      const result = await store.query(`${warehouseSelect} WHERE tenant_id = $1 ORDER BY name`, [tenantId]);
      return result.rows;
    },
    async findById(tenantId, id) {
      const result = await store.query(`${warehouseSelect} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      const x = normalizeWarehouseInput(input);
      const result = await store.query(
        `INSERT INTO warehouses
         (tenant_id, code, name, description, warehouse_type, address1, address2, city, state, postal_code, country, active, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING id::text, tenant_id as "tenantId", code, name, description, warehouse_type as "warehouseType",
                   address1, address2, city, state, postal_code as "postalCode", country, active, notes,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.code, x.name, x.description, x.warehouseType, x.address1, x.address2, x.city, x.state, x.postalCode, x.country, x.active, x.notes]
      );
      return result.rows[0];
    },
    async update(tenantId, id, input) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const x = { ...existing, ...input };
      const result = await store.query(
        `UPDATE warehouses SET code=$3, name=$4, description=$5, warehouse_type=$6, address1=$7,
         address2=$8, city=$9, state=$10, postal_code=$11, country=$12, active=$13, notes=$14, updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", code, name, description, warehouse_type as "warehouseType",
                   address1, address2, city, state, postal_code as "postalCode", country, active, notes,
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, x.code, x.name, x.description || '', x.warehouseType || 'main', x.address1 || '', x.address2 || '', x.city || '', x.state || '', x.postalCode || '', x.country || 'US', x.active !== false, x.notes || '']
      );
      return result.rows[0] || null;
    },
    async listBins(tenantId, warehouseId) {
      const params = warehouseId ? [tenantId, warehouseId] : [tenantId];
      const where = warehouseId ? 'WHERE tenant_id = $1 AND warehouse_id = $2' : 'WHERE tenant_id = $1';
      const result = await store.query(`${binSelect} ${where} ORDER BY sort_order, code`, params);
      return result.rows;
    },
    async createBin(tenantId, input) {
      const x = normalizeBinInput(input);
      const result = await store.query(
        `INSERT INTO warehouse_bins (tenant_id, warehouse_id, code, name, description, active, sort_order)
         VALUES ($1,$2::uuid,$3,$4,$5,$6,$7)
         RETURNING id::text, tenant_id as "tenantId", warehouse_id::text as "warehouseId",
                   code, name, description, active, sort_order as "sortOrder",
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, x.warehouseId, x.code, x.name, x.description, x.active, x.sortOrder]
      );
      return result.rows[0];
    }
  };
}

module.exports = { createWarehouseRepository };
