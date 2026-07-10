const { makeId, now } = require('../services/id');
const { requireFields } = require('../utils/validation');

function createServiceRepository(store) {
  if (store.type === 'json') return createJsonServiceRepository(store);
  if (store.type === 'postgres') return createPostgresServiceRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureServices(data) {
  if (!data.services) data.services = [];
  return data;
}

function createJsonServiceRepository(store) {
  return {
    list(tenantId) {
      return ensureServices(store.read()).services.filter(s => s.tenantId === tenantId && s.active !== false);
    },
    findById(tenantId, id) {
      return ensureServices(store.read()).services.find(s => s.tenantId === tenantId && s.id === id) || null;
    },
    findByCode(tenantId, code) {
      return ensureServices(store.read()).services.find(s => s.tenantId === tenantId && s.code === code) || null;
    },
    create(tenantId, input) {
      requireFields(input, ['code', 'name']);
      const data = ensureServices(store.read());
      if (data.services.some(s => s.tenantId === tenantId && s.code === input.code)) {
        const err = new Error(`Service code already exists: ${input.code}`);
        err.status = 409;
        err.code = 'conflict';
        throw err;
      }
      const service = {
        id: makeId('svc'),
        tenantId,
        code: input.code,
        name: input.name,
        description: input.description || '',
        category: input.category || 'plumbing',
        basePrice: Number(input.basePrice || 0),
        unitCost: Number(input.unitCost || 0),
        taxable: input.taxable !== false,
        active: input.active !== false,
        createdAt: now(),
        updatedAt: now()
      };
      data.services.push(service);
      store.write(data);
      return service;
    },
    update(tenantId, id, input) {
      const data = ensureServices(store.read());
      const idx = data.services.findIndex(s => s.tenantId === tenantId && s.id === id);
      if (idx === -1) return null;
      data.services[idx] = {
        ...data.services[idx],
        ...input,
        id,
        tenantId,
        basePrice: input.basePrice !== undefined ? Number(input.basePrice) : data.services[idx].basePrice,
        unitCost: input.unitCost !== undefined ? Number(input.unitCost) : data.services[idx].unitCost,
        updatedAt: now()
      };
      store.write(data);
      return data.services[idx];
    },
    delete(tenantId, id) {
      const data = ensureServices(store.read());
      const idx = data.services.findIndex(s => s.tenantId === tenantId && s.id === id);
      if (idx === -1) return false;
      data.services[idx].active = false;
      data.services[idx].updatedAt = now();
      store.write(data);
      return true;
    }
  };
}

function createPostgresServiceRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", code, name, description, category,
    base_price::float as "basePrice", unit_cost::float as "unitCost", taxable, active,
    created_at as "createdAt", updated_at as "updatedAt" FROM service_catalog`;

  return {
    async list(tenantId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND active = true ORDER BY category, name`, [tenantId]);
      return result.rows;
    },
    async findById(tenantId, id) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async findByCode(tenantId, code) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND code = $2 LIMIT 1`, [tenantId, code]);
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      requireFields(input, ['code', 'name']);
      const result = await store.query(
        `INSERT INTO service_catalog (tenant_id, code, name, description, category, base_price, unit_cost, taxable, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id::text, tenant_id as "tenantId", code, name, description, category,
                   base_price::float as "basePrice", unit_cost::float as "unitCost",
                   taxable, active, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.code, input.name, input.description || '', input.category || 'plumbing', Number(input.basePrice || 0), Number(input.unitCost || 0), input.taxable !== false, input.active !== false]
      );
      return result.rows[0];
    },
    async update(tenantId, id, input) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;
      const next = { ...existing, ...input };
      const result = await store.query(
        `UPDATE service_catalog
         SET code = $3, name = $4, description = $5, category = $6, base_price = $7,
             unit_cost = $8, taxable = $9, active = $10, updated_at = now()
         WHERE tenant_id = $1 AND id = $2
         RETURNING id::text, tenant_id as "tenantId", code, name, description, category,
                   base_price::float as "basePrice", unit_cost::float as "unitCost",
                   taxable, active, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, next.code, next.name, next.description || '', next.category || 'plumbing', Number(next.basePrice || 0), Number(next.unitCost || 0), next.taxable !== false, next.active !== false]
      );
      return result.rows[0] || null;
    },
    async delete(tenantId, id) {
      const result = await store.query('UPDATE service_catalog SET active = false, updated_at = now() WHERE tenant_id = $1 AND id = $2', [tenantId, id]);
      return result.rowCount > 0;
    }
  };
}

module.exports = { createServiceRepository };
