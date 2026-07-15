const crypto = require('crypto');

function createAuthSessionRepository(store) {
  if (store.type === 'json') return createJsonAuthSessionRepository(store);
  if (store.type === 'postgres') return createPostgresAuthSessionRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureIdentity(data) {
  for (const key of ['authSessions', 'passwordResetTokens', 'invitations', 'mfaChallenges']) {
    if (!data[key]) data[key] = [];
  }
  return data;
}

function active(record) {
  return record && !record.revokedAt && !record.usedAt && Date.parse(record.expiresAt) > Date.now();
}

function createJsonAuthSessionRepository(store) {
  return {
    async createSession(input) {
      const data = ensureIdentity(store.read());
      const record = { id: crypto.randomUUID(), ...input, issuedAt: new Date().toISOString(), revokedAt: null };
      data.authSessions.push(record); store.write(data); return record;
    },
    async findActiveByRefreshHash(tenantId, hash) {
      const data = ensureIdentity(store.read());
      return data.authSessions.find(row => row.tenantId === tenantId && row.refreshTokenHash === hash && active(row)) || null;
    },
    async isActive(id, tenantId, userId) {
      const data = ensureIdentity(store.read());
      return data.authSessions.some(row => row.id === id && row.tenantId === tenantId && row.userId === userId && active(row));
    },
    async rotate(id, currentHash, refreshTokenHash, expiresAt) {
      const data = ensureIdentity(store.read()); const row = data.authSessions.find(item => item.id === id);
      if (!row || !active(row) || row.refreshTokenHash !== currentHash) return null; Object.assign(row, { refreshTokenHash, expiresAt }); store.write(data); return row;
    },
    async revoke(id) { const data = ensureIdentity(store.read()); const row = data.authSessions.find(item => item.id === id); if (row) row.revokedAt = new Date().toISOString(); store.write(data); return Boolean(row); },
    async revokeForUser(tenantId, userId) { const data = ensureIdentity(store.read()); let count = 0; for (const row of data.authSessions) if (row.tenantId === tenantId && row.userId === userId && active(row)) { row.revokedAt = new Date().toISOString(); count += 1; } store.write(data); return count; },
    async createPasswordReset(input) { return createOneTime(store, 'passwordResetTokens', input); },
    async consumePasswordReset(tenantId, hash) { return consumeOneTime(store, 'passwordResetTokens', tenantId, hash); },
    async createInvitation(input) { return createOneTime(store, 'invitations', input); },
    async consumeInvitation(tenantId, hash) { return consumeOneTime(store, 'invitations', tenantId, hash); },
    async createMfaChallenge(input) { return createOneTime(store, 'mfaChallenges', input); },
    async consumeMfaChallenge(tenantId, id, hash) {
      const data = ensureIdentity(store.read());
      const row = data.mfaChallenges.find(item => item.id === id && item.tenantId === tenantId && item.tokenHash === hash && active(item));
      if (!row) return null; row.usedAt = new Date().toISOString(); store.write(data); return row;
    }
  };
}

function createOneTime(store, key, input) {
  const data = ensureIdentity(store.read());
  for (const row of data[key]) if (row.tenantId === input.tenantId && row.userId === input.userId && active(row)) row.revokedAt = new Date().toISOString();
  const record = { id: crypto.randomUUID(), ...input, createdAt: new Date().toISOString(), usedAt: null, revokedAt: null };
  data[key].push(record); store.write(data); return record;
}

function consumeOneTime(store, key, tenantId, hash) {
  const data = ensureIdentity(store.read());
  const row = data[key].find(item => item.tenantId === tenantId && item.tokenHash === hash && active(item));
  if (!row) return null; row.usedAt = new Date().toISOString(); store.write(data); return row;
}

function createPostgresAuthSessionRepository(store) {
  return {
    async createSession(input) {
      const result = await store.query(`INSERT INTO runtime_auth_sessions (tenant_id,user_id,refresh_token_hash,ip_address,user_agent,expires_at) VALUES ($1,$2::uuid,$3,$4,$5,$6) RETURNING id::text,tenant_id as "tenantId",user_id::text as "userId",expires_at as "expiresAt"`, [input.tenantId,input.userId,input.refreshTokenHash,input.ipAddress || null,input.userAgent || null,input.expiresAt]); return result.rows[0];
    },
    async findActiveByRefreshHash(tenantId, hash) { const result = await store.query(`SELECT id::text,tenant_id as "tenantId",user_id::text as "userId",expires_at as "expiresAt" FROM runtime_auth_sessions WHERE tenant_id=$1 AND refresh_token_hash=$2 AND revoked_at IS NULL AND expires_at>now() LIMIT 1`,[tenantId,hash]); return result.rows[0] || null; },
    async isActive(id, tenantId, userId) { const result = await store.query(`SELECT 1 FROM runtime_auth_sessions WHERE id=$1::uuid AND tenant_id=$2 AND user_id=$3::uuid AND revoked_at IS NULL AND expires_at>now()`,[id,tenantId,userId]); return result.rowCount === 1; },
    async rotate(id, currentHash, hash, expiresAt) { const result = await store.query(`UPDATE runtime_auth_sessions SET refresh_token_hash=$3,expires_at=$4 WHERE id=$1::uuid AND refresh_token_hash=$2 AND revoked_at IS NULL AND expires_at>now() RETURNING id::text`,[id,currentHash,hash,expiresAt]); return result.rows[0] || null; },
    async revoke(id) { const result = await store.query(`UPDATE runtime_auth_sessions SET revoked_at=now() WHERE id=$1::uuid AND revoked_at IS NULL`,[id]); return result.rowCount > 0; },
    async revokeForUser(tenantId,userId) { const result = await store.query(`UPDATE runtime_auth_sessions SET revoked_at=now() WHERE tenant_id=$1 AND user_id=$2::uuid AND revoked_at IS NULL`,[tenantId,userId]); return result.rowCount; },
    async createPasswordReset(input) { return insertOneTime(store, 'runtime_password_reset_tokens', input); },
    async consumePasswordReset(tenantId, hash) { return consumePostgresOneTime(store, 'runtime_password_reset_tokens', tenantId, hash); },
    async createInvitation(input) { return insertOneTime(store, 'runtime_invitations', input); },
    async consumeInvitation(tenantId, hash) { return consumePostgresOneTime(store, 'runtime_invitations', tenantId, hash); },
    async createMfaChallenge(input) { const result = await store.query(`INSERT INTO runtime_mfa_challenges (tenant_id,user_id,challenge_hash,expires_at) VALUES ($1,$2::uuid,$3,$4) RETURNING id::text,tenant_id as "tenantId",user_id::text as "userId",expires_at as "expiresAt"`,[input.tenantId,input.userId,input.tokenHash,input.expiresAt]); return result.rows[0]; },
    async consumeMfaChallenge(tenantId,id,hash) { const result = await store.query(`UPDATE runtime_mfa_challenges SET used_at=now() WHERE id=$1::uuid AND tenant_id=$2 AND challenge_hash=$3 AND used_at IS NULL AND revoked_at IS NULL AND expires_at>now() RETURNING id::text,tenant_id as "tenantId",user_id::text as "userId"`,[id,tenantId,hash]); return result.rows[0] || null; }
  };
}

async function insertOneTime(store, table, input) {
  await store.query(`UPDATE ${table} SET revoked_at=now() WHERE tenant_id=$1 AND user_id=$2::uuid AND used_at IS NULL AND revoked_at IS NULL`,[input.tenantId,input.userId]);
  const extra = table === 'runtime_invitations' ? ',email,name' : '';
  const values = table === 'runtime_invitations' ? ',$5,$6' : '';
  const params = [input.tenantId,input.userId,input.tokenHash,input.expiresAt];
  if (table === 'runtime_invitations') params.push(input.email,input.name || '');
  const result = await store.query(`INSERT INTO ${table} (tenant_id,user_id,token_hash,expires_at${extra}) VALUES ($1,$2::uuid,$3,$4${values}) RETURNING id::text,tenant_id as "tenantId",user_id::text as "userId",expires_at as "expiresAt"`,params); return result.rows[0];
}

async function consumePostgresOneTime(store, table, tenantId, hash) {
  const extra = table === 'runtime_invitations' ? ',email,name' : '';
  const result = await store.query(`UPDATE ${table} SET used_at=now() WHERE tenant_id=$1 AND token_hash=$2 AND used_at IS NULL AND revoked_at IS NULL AND expires_at>now() RETURNING id::text,tenant_id as "tenantId",user_id::text as "userId"${extra}`,[tenantId,hash]); return result.rows[0] || null;
}

module.exports = { createAuthSessionRepository };
