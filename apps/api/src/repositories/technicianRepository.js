const { makeId, now } = require('../services/id');
const { requireFields } = require('../utils/validation');

function createTechnicianRepository(store) {
  if (store.type === 'json') return createJsonTechnicianRepository(store);
  if (store.type === 'postgres') return createPostgresTechnicianRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureTechnicians(data) {
  if (!data.technicians) data.technicians = [];
  return data;
}

function createJsonTechnicianRepository(store) {
  return {
    list(tenantId) {
      return ensureTechnicians(store.read()).technicians.filter(t => t.tenantId === tenantId && t.active !== false);
    },
    findById(tenantId, id) {
      return ensureTechnicians(store.read()).technicians.find(t => t.tenantId === tenantId && t.id === id) || null;
    },
    create(tenantId, input) {
      requireFields(input, ['name']);
      const data = ensureTechnicians(store.read());
      const technician = {
        id: makeId('tech'),
        tenantId,
        name: input.name,
        email: input.email || '',
        phone: input.phone || '',
        skills: input.skills || [],
        active: input.active !== false,
        createdAt: now(),
        updatedAt: now()
      };
      data.technicians.push(technician);
      store.write(data);
      return technician;
    }
  };
}

function createPostgresTechnicianRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", name, email, phone, skills,
    active, created_at as "createdAt", updated_at as "updatedAt" FROM technicians`;

  return {
    async list(tenantId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND active = true ORDER BY name`, [tenantId]);
      return result.rows;
    },
    async findById(tenantId, id) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      requireFields(input, ['name']);
      const result = await store.query(
        `INSERT INTO technicians (tenant_id, name, email, phone, skills, active)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6)
         RETURNING id::text, tenant_id as "tenantId", name, email, phone, skills,
                   active, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.name, input.email || '', input.phone || '', JSON.stringify(input.skills || []), input.active !== false]
      );
      return result.rows[0];
    }
  };
}

module.exports = { createTechnicianRepository };
