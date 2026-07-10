const { makeId, now } = require('../services/id');
const { requireFields } = require('../utils/validation');

function createJobRepository(store) {
  if (store.type === 'json') return createJsonJobRepository(store);
  if (store.type === 'postgres') return createPostgresJobRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonJobRepository(store) {
  return {
    list(tenantId) {
      return store.read().jobs.filter(j => j.tenantId === tenantId);
    },
    findById(tenantId, id) {
      return store.read().jobs.find(j => j.tenantId === tenantId && j.id === id) || null;
    },
    create(tenantId, input) {
      requireFields(input, ['title']);
      const data = store.read();
      const job = {
        id: makeId('job'),
        tenantId,
        customerId: input.customerId || '',
        title: input.title,
        status: input.status || 'open',
        priority: input.priority || 'normal',
        createdAt: now(),
        updatedAt: now()
      };
      data.jobs.push(job);
      store.write(data);
      return job;
    },
    update(tenantId, id, input) {
      const data = store.read();
      const idx = data.jobs.findIndex(j => j.tenantId === tenantId && j.id === id);
      if (idx === -1) return null;
      data.jobs[idx] = { ...data.jobs[idx], ...input, id, tenantId, updatedAt: now() };
      store.write(data);
      return data.jobs[idx];
    },
    delete(tenantId, id) {
      const data = store.read();
      const before = data.jobs.length;
      data.jobs = data.jobs.filter(j => !(j.tenantId === tenantId && j.id === id));
      const deleted = data.jobs.length !== before;
      if (deleted) store.write(data);
      return deleted;
    }
  };
}

function createPostgresJobRepository(store) {
  return {
    async list(tenantId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                title, status, priority, created_at as "createdAt", updated_at as "updatedAt"
         FROM jobs
         WHERE tenant_id = $1
         ORDER BY created_at DESC`,
        [tenantId]
      );
      return result.rows;
    },
    async findById(tenantId, id) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                title, status, priority, created_at as "createdAt", updated_at as "updatedAt"
         FROM jobs
         WHERE tenant_id = $1 AND id = $2
         LIMIT 1`,
        [tenantId, id]
      );
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      requireFields(input, ['title']);
      const result = await store.query(
        `INSERT INTO jobs (tenant_id, customer_id, title, status, priority)
         VALUES ($1, NULLIF($2, '')::uuid, $3, $4, $5)
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   title, status, priority, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.customerId || '', input.title, input.status || 'open', input.priority || 'normal']
      );
      return result.rows[0];
    },
    async update(tenantId, id, input) {
      const existing = await this.findById(tenantId, id);
      if (!existing) return null;

      const next = {
        title: input.title ?? existing.title,
        status: input.status ?? existing.status,
        priority: input.priority ?? existing.priority,
        customerId: input.customerId ?? existing.customerId ?? ''
      };

      const result = await store.query(
        `UPDATE jobs
         SET customer_id = NULLIF($3, '')::uuid, title = $4, status = $5, priority = $6, updated_at = now()
         WHERE tenant_id = $1 AND id = $2
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   title, status, priority, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, id, next.customerId, next.title, next.status, next.priority]
      );

      return result.rows[0] || null;
    },
    async delete(tenantId, id) {
      const result = await store.query(
        'DELETE FROM jobs WHERE tenant_id = $1 AND id = $2',
        [tenantId, id]
      );
      return result.rowCount > 0;
    }
  };
}

module.exports = { createJobRepository };
