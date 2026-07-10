const crypto = require('crypto');
const { insert, read, update } = require('../db/store');

function hashKey(rawKey) {
  const pepper = process.env.API_KEY_PEPPER || 'dev-pepper';
  return crypto.createHash('sha256').update(`${rawKey}:${pepper}`).digest('hex');
}

function createApiKey({ tenantId, name, scopes, createdBy }) {
  const rawKey = `sp_${crypto.randomBytes(24).toString('hex')}`;
  const keyHash = hashKey(rawKey);
  const visiblePrefix = rawKey.slice(0, 10);
  const record = insert('apiKeys', {
    tenantId,
    name,
    scopes: Array.isArray(scopes) ? scopes : String(scopes || '').split(',').map(s => s.trim()).filter(Boolean),
    keyHash,
    visiblePrefix,
    active: true,
    lastUsedAt: null,
    createdBy
  });
  return { record, rawKey };
}

function authenticate(rawKey) {
  const db = read();
  const keyHash = hashKey(rawKey || '');
  const record = db.apiKeys.find(k => k.keyHash === keyHash && k.active);
  if (!record) return null;
  update('apiKeys', record.id, { lastUsedAt: new Date().toISOString() });
  const tenant = db.tenants.find(t => t.id === record.tenantId);
  return { apiKey: record, tenant };
}

function hasScope(apiKey, scope) {
  return apiKey.scopes.includes('*') || apiKey.scopes.includes(scope);
}

module.exports = { createApiKey, authenticate, hasScope, hashKey };
