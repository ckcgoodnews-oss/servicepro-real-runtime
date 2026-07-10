const { makeId, now } = require('../services/id');
const { requireFields, optionalEmail } = require('../utils/validation');

function createCustomerRepository(store) {
  if (store.type === 'json') return createJsonCustomerRepository(store);
  if (store.type === 'postgres') return createPostgresCustomerRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonCustomerRepository(store) {
  return {
    list(tenantId) {
      return store.read().customers.filter(c => c.tenantId === tenantId);
    },
    findById(tenantId, id) {
      return store.read().customers.find(c => c.tenantId === tenantId && c.id === id) || null;
    },
    create(tenantId, input) {
      requireFields(input, ['firstName', 'lastName']);
      optionalEmail(input, 'email');
      const data = store.read();
      const customer = {
        id: makeId('cust'),
        tenantId,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone || '',
        email: input.email || '',
        createdAt: now(),
        updatedAt: now()
      };
      data.customers.push(customer);
      store.write(data);
      return customer;
    },
    update(tenantId, id, input) {
      optionalEmail(input, 'email');
      const data = store.read();
      const idx = data.customers.findIndex(c => c.tenantId === tenantId && c.id === id);
      if (idx === -1) return null;
      data.customers[idx] = { ...data.customers[idx], ...input, id, tenantId, updatedAt: now() };
      store.write(data);
      return data.customers[idx];
    },
    delete(tenantId, id) {
      const data = store.read();
      const before = data.customers.length;
      data.customers = data.customers.filter(c => !(c.tenantId === tenantId && c.id === id));
      const deleted = data.customers.length !== before;
      if (deleted) store.write(data);
      return deleted;
    }
  };
}

function createPostgresCustomerRepository(store) {
  return {
    async list(tenantId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", first_name as "firstName", last_name as "lastName",
                phone, email, created_at as "createdAt", updated_at as "updatedAt"
         FROM customers
         WHERE tenant_id = $1
         ORDER BY last_name, first_name`,
        [tenantId]
      );
      return result.rows;
    },
    async findById(tenantId, id) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", first_name as "firstName", last_name as "lastName",
                phone, email, created_at as "createdAt", updated_at as "updatedAt"
         FROM customers
         WHERE tenant_id = $1 AND id = $2
         LIMIT 1`,
        [tenantId, id]
      );
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      requireFields(input, ['firstName', 'lastName']);
      optionalEmail(input, 'email');
      const result = await store.query(
        `INSERT INTO customers (tenant_id, first_name, last_name, phone, email)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id::text, tenant_id as "tenantId", first_name as "firstName", last_name as "lastName",
                   phone, email, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.firstName, input.lastName, input.phone || '', input.email || '']
      );
      return result.rows[0];
    },
    async update(tenantId, id, input) {
      optionalEmail(input, 'email');
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;

      const next = {
        firstName: input.firstName ?? existing.firstName,
        lastName: input.lastName ?? existing.lastName,
        phone: input.phone ?? existing.phone,
        email: input.email ?? existing.email
      };

      const result = await store.query(
        `UPDATE customers
         SET first_name = $3, last_name = $4, phone = $5, email = $6, updated_at = now()
         WHERE tenant_id = $1 AND id = $2
         RETURNING id::text, tenant_id as "tenantId", first_name as "firstName", last_name as "lastName",
                   phone, email, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, next.firstName, next.lastName, next.phone, next.email]
      );

      return result.rows[0] || null;
    },
    async delete(tenantId, id) {
      const result = await store.query(
        'DELETE FROM customers WHERE tenant_id = $1 AND id = $2',
        [tenantId, id]
      );
      return result.rowCount > 0;
    }
  };
}

module.exports = { createCustomerRepository };
