const crypto = require('crypto');
const { hashPassword } = require('../services/passwordService');

function createUserRepository(store) {
  if (store.type === 'json') return createJsonUserRepository(store);
  if (store.type === 'postgres') return createPostgresUserRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureUsers(data) {
  if (!data.users) data.users = [];
  if (!data.userApiTokens) data.userApiTokens = [];
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
    },
    async updateProfile(tenantId, id, input) {
      const data = ensureUsers(store.read()); const user = data.users.find(u => u.tenantId === tenantId && u.id === id);
      if (!user) return null;
      for (const field of ['name','avatarUrl','timezone','locale']) if (input[field] !== undefined) user[field] = input[field];
      if (input.notificationPreferences !== undefined) user.notificationPreferences = input.notificationPreferences;
      user.updatedAt = new Date().toISOString(); store.write(data); return user;
    },
    async setMfaEnabled(tenantId, id, enabled) {
      const data = ensureUsers(store.read()); const user = data.users.find(u => u.tenantId === tenantId && u.id === id);
      if (!user) return null; user.mfaEnabled = Boolean(enabled); user.updatedAt = new Date().toISOString(); store.write(data); return user;
    },
    async listApiTokens(tenantId, userId) {
      return ensureUsers(store.read()).userApiTokens.filter(row => row.tenantId === tenantId && row.userId === userId && !row.revokedAt).sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    },
    async createApiToken(input) {
      const data = ensureUsers(store.read()); const row = { id: crypto.randomUUID(), ...input, createdAt: new Date().toISOString(), lastUsedAt: null, revokedAt: null };
      data.userApiTokens.push(row); store.write(data); return row;
    },
    async revokeApiToken(tenantId, userId, id) {
      const data = ensureUsers(store.read()); const row = data.userApiTokens.find(item => item.id === id && item.tenantId === tenantId && item.userId === userId && !item.revokedAt);
      if (!row) return false; row.revokedAt = new Date().toISOString(); store.write(data); return true;
    },
    async findByApiToken(tenantId, tokenHash) {
      const data = ensureUsers(store.read()); const token = data.userApiTokens.find(row => row.tenantId === tenantId && row.tokenHash === tokenHash && !row.revokedAt && (!row.expiresAt || Date.parse(row.expiresAt) > Date.now()));
      if (!token) return null; token.lastUsedAt = new Date().toISOString(); store.write(data);
      const user = data.users.find(row => row.tenantId === tenantId && row.id === token.userId); return user ? { user, tokenId: token.id } : null;
    }
  };
}

function createPostgresUserRepository(store) {
  return {
    async findById(tenantId, id) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", email, name, password_hash as "passwordHash",
                roles, permissions, mfa_enabled as "mfaEnabled", avatar_url as "avatarUrl", timezone, locale,
                notification_preferences as "notificationPreferences", created_at as "createdAt", updated_at as "updatedAt"
         FROM runtime_users WHERE tenant_id=$1 AND id=$2::uuid LIMIT 1`, [tenantId,id]
      ); return result.rows[0] || null;
    },
    async findByEmail(tenantId, email) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", email, name, password_hash as "passwordHash",
                roles, permissions, mfa_enabled as "mfaEnabled", avatar_url as "avatarUrl", timezone, locale,
                notification_preferences as "notificationPreferences", created_at as "createdAt", updated_at as "updatedAt"
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
    },
    async updateProfile(tenantId,id,input) {
      const result = await store.query(`UPDATE runtime_users SET name=$3,avatar_url=$4,timezone=$5,locale=$6,notification_preferences=$7::jsonb,updated_at=now() WHERE tenant_id=$1 AND id=$2::uuid RETURNING id::text,tenant_id as "tenantId",email,name,roles,permissions,mfa_enabled as "mfaEnabled",avatar_url as "avatarUrl",timezone,locale,notification_preferences as "notificationPreferences"`,[tenantId,id,input.name,input.avatarUrl || '',input.timezone,input.locale,JSON.stringify(input.notificationPreferences || {})]); return result.rows[0] || null;
    },
    async setMfaEnabled(tenantId,id,enabled) {
      const result = await store.query(`UPDATE runtime_users SET mfa_enabled=$3,updated_at=now() WHERE tenant_id=$1 AND id=$2::uuid RETURNING id::text,mfa_enabled as "mfaEnabled"`,[tenantId,id,Boolean(enabled)]); return result.rows[0] || null;
    },
    async listApiTokens(tenantId,userId) {
      const result = await store.query(`SELECT id::text,name,last_four as "lastFour",created_at as "createdAt",last_used_at as "lastUsedAt",expires_at as "expiresAt" FROM runtime_user_api_tokens WHERE tenant_id=$1 AND user_id=$2::uuid AND revoked_at IS NULL ORDER BY created_at DESC`,[tenantId,userId]); return result.rows;
    },
    async createApiToken(input) {
      const result = await store.query(`INSERT INTO runtime_user_api_tokens (tenant_id,user_id,name,token_hash,last_four,expires_at) VALUES ($1,$2::uuid,$3,$4,$5,$6) RETURNING id::text,name,last_four as "lastFour",created_at as "createdAt",last_used_at as "lastUsedAt",expires_at as "expiresAt"`,[input.tenantId,input.userId,input.name,input.tokenHash,input.lastFour,input.expiresAt || null]); return result.rows[0];
    },
    async revokeApiToken(tenantId,userId,id) {
      const result = await store.query(`UPDATE runtime_user_api_tokens SET revoked_at=now() WHERE id=$1::uuid AND tenant_id=$2 AND user_id=$3::uuid AND revoked_at IS NULL`,[id,tenantId,userId]); return result.rowCount > 0;
    },
    async findByApiToken(tenantId,tokenHash) {
      const result = await store.query(`SELECT u.id::text,u.tenant_id as "tenantId",u.email,u.name,u.roles,u.permissions,u.mfa_enabled as "mfaEnabled",t.id::text as "tokenId" FROM runtime_user_api_tokens t JOIN runtime_users u ON u.id=t.user_id AND u.tenant_id=t.tenant_id WHERE t.tenant_id=$1 AND t.token_hash=$2 AND t.revoked_at IS NULL AND (t.expires_at IS NULL OR t.expires_at>now()) LIMIT 1`,[tenantId,tokenHash]);
      const row = result.rows[0]; if (!row) return null; await store.query(`UPDATE runtime_user_api_tokens SET last_used_at=now() WHERE id=$1::uuid`,[row.tokenId]); const { tokenId,...user } = row; return { user,tokenId };
    }
  };
}

module.exports = { createUserRepository };
