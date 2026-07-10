const { makeId, now } = require('../services/id');
const { hashPassword } = require('../services/passwordService');
const { requireFields, optionalEmail } = require('../utils/validation');

function createPortalAccountRepository(store) {
  if (store.type === 'json') return createJsonPortalAccountRepository(store);
  if (store.type === 'postgres') return createPostgresPortalAccountRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensurePortal(data) {
  if (!data.portalAccounts) data.portalAccounts = [];
  return data;
}

function createJsonPortalAccountRepository(store) {
  return {
    list(tenantId) {
      return ensurePortal(store.read()).portalAccounts.filter(a => a.tenantId === tenantId && a.enabled !== false);
    },
    findByEmail(tenantId, email) {
      return ensurePortal(store.read()).portalAccounts.find(a => a.tenantId === tenantId && a.email.toLowerCase() === String(email).toLowerCase()) || null;
    },
    findById(tenantId, id) {
      return ensurePortal(store.read()).portalAccounts.find(a => a.tenantId === tenantId && a.id === id) || null;
    },
    async create(tenantId, input) {
      requireFields(input, ['customerId', 'email', 'password']);
      optionalEmail(input, 'email');
      const data = ensurePortal(store.read());
      if (data.portalAccounts.some(a => a.tenantId === tenantId && a.email.toLowerCase() === input.email.toLowerCase())) {
        const err = new Error('Portal account already exists for email');
        err.status = 409;
        err.code = 'conflict';
        throw err;
      }
      const account = {
        id: makeId('portal'),
        tenantId,
        customerId: input.customerId,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        enabled: input.enabled !== false,
        createdAt: now(),
        updatedAt: now()
      };
      data.portalAccounts.push(account);
      store.write(data);
      return account;
    }
  };
}

function createPostgresPortalAccountRepository(store) {
  const selectSql = `SELECT id::text, tenant_id as "tenantId", customer_id::text as "customerId",
    email, password_hash as "passwordHash", enabled, created_at as "createdAt", updated_at as "updatedAt"
    FROM portal_accounts`;

  return {
    async list(tenantId) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND enabled = true ORDER BY email`, [tenantId]);
      return result.rows;
    },
    async findByEmail(tenantId, email) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND lower(email) = lower($2) LIMIT 1`, [tenantId, email]);
      return result.rows[0] || null;
    },
    async findById(tenantId, id) {
      const result = await store.query(`${selectSql} WHERE tenant_id = $1 AND id = $2 LIMIT 1`, [tenantId, id]);
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      requireFields(input, ['customerId', 'email', 'password']);
      optionalEmail(input, 'email');
      const passwordHash = await hashPassword(input.password);
      const result = await store.query(
        `INSERT INTO portal_accounts (tenant_id, customer_id, email, password_hash, enabled)
         VALUES ($1, $2::uuid, $3, $4, $5)
         RETURNING id::text, tenant_id as "tenantId", customer_id::text as "customerId",
                   email, password_hash as "passwordHash", enabled, created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.customerId, input.email, passwordHash, input.enabled !== false]
      );
      return result.rows[0];
    }
  };
}

module.exports = { createPortalAccountRepository };
