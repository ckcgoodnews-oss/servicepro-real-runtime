const { sendJson } = require('../utils/http');
const { isPlatformAdmin } = require('../services/platformAdminService');

function deny(res) {
  return sendJson(res, 403, { error: { code: 'platform_admin_required', message: 'Platform administrator access required' } });
}

function repo(req) {
  return req.context.repositories.tenantManagement;
}

async function list(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).list(req.context.repositories) });
}

async function detail(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  const tenant = await repo(req).detail(tenantId, req.context.repositories);
  return tenant ? sendJson(res, 200, { data: tenant }) : sendJson(res, 404, { error: { code: 'tenant_not_found', message: 'Tenant not found' } });
}

async function update(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  const row = await repo(req).update(tenantId, req.body || {}, req.context.userId);
  return sendJson(res, 200, { data: row });
}

async function action(req, res, tenantId, verb) {
  if (!isPlatformAdmin(req)) return deny(res);
  const actions = { archive: 'archive', restore: 'restore', 'soft-delete': 'softDelete' };
  const method = actions[verb];
  if (!method) return sendJson(res, 404, { error: { code: 'not_found', message: 'Action not found' } });
  return sendJson(res, 200, { data: await repo(req)[method](tenantId, req.context.userId) });
}

async function ownerAction(req, res, tenantId, ownerId, verb) {
  if (!isPlatformAdmin(req)) return deny(res);
  const method = verb === 'restore' ? 'restoreOwner' : verb === 'soft-delete' ? 'softDeleteOwner' : '';
  if (!method) return sendJson(res, 404, { error: { code: 'not_found', message: 'Owner action not found' } });
  const owner = await repo(req)[method](tenantId, ownerId, req.context.userId);
  return owner ? sendJson(res, 200, { data: owner }) : sendJson(res, 404, { error: { code: 'owner_not_found', message: 'Owner not found' } });
}

async function saveDomain(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  const row = await repo(req).saveDomain(tenantId, req.body || {}, req.context.userId);
  return row ? sendJson(res, 201, { data: row }) : sendJson(res, 400, { error: { code: 'validation_failed', message: 'Domain is required' } });
}

async function createApiKey(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 201, { data: await repo(req).createApiKey(tenantId, req.body || {}, req.context.userId) });
}

async function revokeApiKey(req, res, tenantId, keyId) {
  if (!isPlatformAdmin(req)) return deny(res);
  const row = await repo(req).revokeApiKey(tenantId, keyId, req.context.userId);
  return row ? sendJson(res, 200, { data: row }) : sendJson(res, 404, { error: { code: 'api_key_not_found', message: 'API key not found' } });
}

async function audit(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).audit(tenantId) });
}

module.exports = { list, detail, update, action, ownerAction, saveDomain, createApiKey, revokeApiKey, audit };
