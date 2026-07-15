const crypto = require('crypto');
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
    async findById(tenantId, id) {
      const data = ensureUsers(store.read());
      return data.users.find(u => u.tenantId === tenantId && u.id === id) || null;
    },
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
    },
    async create(input) {
      const data = ensureUsers(store.read());
      if (data.users.some(u => u.tenantId === input.tenantId && u.email.toLowerCase() === input.email.toLowerCase())) return null;
      const user = { id: crypto.randomUUID(), tenantId: input.tenantId, email: input.email, name: input.name || '', passwordHash: await hashPassword(input.password), roles: input.roles || ['technician'], permissions: [], mfaEnabled: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      data.users.push(user); store.write(data); return user;
    },
    async updatePassword(tenantId, id, password) {
      const data = ensureUsers(store.read()); const user = data.users.find(u => u.tenantId === tenantId && u.id === id);
      if (!user) return null; user.passwordHash = await hashPassword(password); user.updatedAt = new Date().toISOString(); store.write(data); return user;
    }
  };
}

function createPostgresUserRepository(store) {
  return {
    async findById(tenantId, id) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", email, name, password_hash as "passwordHash",
                roles, permissions, mfa_enabled as "mfaEnabled", created_at as "createdAt", updated_at as "updatedAt"
         FROM runtime_users WHERE tenant_id=$1 AND id=$2::uuid LIMIT 1`, [tenantId,id]
      ); return result.rows[0] || null;
    },
    async findByEmail(tenantId, email) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", email, name, password_hash as "passwordHash",
                roles, permissions, mfa_enabled as "mfaEnabled", created_at as "createdAt", updated_at as "updatedAt"
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
    },
    async create(input) {
      const result = await store.query(
        `INSERT INTO runtime_users (tenant_id,email,name,password_hash,roles,permissions) VALUES ($1,$2,$3,$4,$5::jsonb,'[]'::jsonb)
         ON CONFLICT DO NOTHING RETURNING id::text,tenant_id as "tenantId",email,name,roles,permissions,mfa_enabled as "mfaEnabled"`,
        [input.tenantId,input.email,input.name || '',await hashPassword(input.password),JSON.stringify(input.roles || ['technician'])]
      ); return result.rows[0] || null;
    },
    async updatePassword(tenantId,id,password) {
      const result = await store.query(`UPDATE runtime_users SET password_hash=$3,updated_at=now() WHERE tenant_id=$1 AND id=$2::uuid RETURNING id::text,tenant_id as "tenantId",email,name,roles,permissions,mfa_enabled as "mfaEnabled"`,[tenantId,id,await hashPassword(password)]); return result.rows[0] || null;
    }
  };
}

module.exports = { createUserRepository };
