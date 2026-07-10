const { hashPassword } = require('../services/passwordService');

function createUserRepository(store) {
  if (store.type === 'json') return createJsonUserRepository(store);
  if (store.type === 'postgres') return createPostgresUserRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureUsers(data) {
  if (!data.users) data.users = [];
  return data;
}

function createJsonUserRepository(store) {
  return {
    async findByEmail(tenantId, email) {
      const data = ensureUsers(store.read());
      return data.users.find(u => u.tenantId === tenantId && u.email.toLowerCase() === String(email).toLowerCase()) || null;
    },
    async createSeedOwner(tenantId, email, password) {
      const data = ensureUsers(store.read());
      const existing = data.users.find(u => u.tenantId === tenantId && u.email.toLowerCase() === email.toLowerCase());
      if (existing) return existing;

      const user = {
        id: 'user_owner',
        tenantId,
        email,
        name: 'Business Owner',
        passwordHash: await hashPassword(password),
        roles: ['owner'],
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      data.users.push(user);
      store.write(data);
      return user;
    }
  };
}

function createPostgresUserRepository(store) {
  return {
    async findByEmail(tenantId, email) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", email, name, password_hash as "passwordHash",
                roles, permissions, created_at as "createdAt", updated_at as "updatedAt"
         FROM runtime_users
         WHERE tenant_id = $1 AND lower(email) = lower($2)
         LIMIT 1`,
        [tenantId, email]
      );
      return result.rows[0] || null;
    },
    async createSeedOwner(tenantId, email, password) {
      const existing = await this.findByEmail(tenantId, email);
      if (existing) return existing;
      const passwordHash = await hashPassword(password);
      const result = await store.query(
        `INSERT INTO runtime_users (tenant_id, email, name, password_hash, roles, permissions)
         VALUES ($1, $2, 'Business Owner', $3, $4::jsonb, $5::jsonb)
         RETURNING id::text, tenant_id as "tenantId", email, name, password_hash as "passwordHash",
                   roles, permissions, created_at as "createdAt", updated_at as "updatedAt"`,
        [
          tenantId,
          email,
          passwordHash,
          JSON.stringify(['owner']),
          JSON.stringify([])
        ]
      );
      return result.rows[0];
    }
  };
}

module.exports = { createUserRepository };
