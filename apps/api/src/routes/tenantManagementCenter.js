const { sendJson } = require('../utils/http');
const { isPlatformAdmin } = require('../services/platformAdminService');

function deny(res) {
  return sendJson(res, 403, { error: { code: 'platform_admin_required', message: 'Platform administrator access required' } });
}

function repo(req) {
  return req.context.repositories.tenantManagementCenter;
}

function actor(req) {
  return req.context.userId || '';
}

function adminEmail(req) {
  return req.context.email || '';
}

// ---- Sprint 1: Create Tenant ----
async function createTenant(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  const result = await repo(req).createTenant(req.body || {}, actor(req));
  if (!result) return sendJson(res, 409, { error: { code: 'conflict', message: 'Tenant already exists' } });
  return sendJson(res, 201, { data: result });
}

// ---- Sprint 1: Transfer Owner ----
async function transferOwner(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  const { ownerId, fromTenantId, toTenantId } = req.body || {};
  if (!ownerId || !fromTenantId || !toTenantId) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'ownerId, fromTenantId, and toTenantId are required' } });
  }
  const result = await repo(req).transferOwner(ownerId, fromTenantId, toTenantId, actor(req));
  if (!result) return sendJson(res, 404, { error: { code: 'not_found', message: 'Owner not found in source tenant' } });
  return sendJson(res, 200, { data: result });
}

// ---- Sprint 2: Bulk Operations ----
async function bulkStatus(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  const { tenantIds, status } = req.body || {};
  if (!Array.isArray(tenantIds) || !status) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'tenantIds array and status are required' } });
  }
  const result = await repo(req).bulkUpdateStatus(tenantIds, status, actor(req));
  return sendJson(res, 200, { data: result });
}

// ---- Sprint 3: Impersonation ----
async function startImpersonation(req, res, tenantId, ownerId) {
  if (!isPlatformAdmin(req)) return deny(res);
  const mode = (req.body || {}).mode || 'full';
  const result = await repo(req).startImpersonation(
    actor(req), adminEmail(req), tenantId, ownerId,
    { mode, ipAddress: req.headers['x-forwarded-for'] || '', userAgent: req.headers['user-agent'] || '' }
  );
  if (!result) return sendJson(res, 404, { error: { code: 'owner_not_found', message: 'Owner not found in tenant' } });
  return sendJson(res, 201, { data: result });
}

async function endImpersonation(req, res, sessionId) {
  if (!isPlatformAdmin(req)) return deny(res);
  const reason = (req.body || {}).reason || 'manual';
  const result = await repo(req).endImpersonation(sessionId, reason, actor(req));
  if (!result) return sendJson(res, 404, { error: { code: 'session_not_found', message: 'Active impersonation session not found' } });
  return sendJson(res, 200, { data: result });
}

async function listImpersonationSessions(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listImpersonationSessions(tenantId) });
}

async function terminateAllSessions(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).terminateAllSessions(tenantId, actor(req)) });
}

// ---- Sprint 4: Subscription & Billing ----
async function updateSubscription(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  const result = await repo(req).updateSubscription(tenantId, req.body || {}, actor(req));
  if (!result) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'No valid subscription fields provided' } });
  return sendJson(res, 200, { data: result });
}

async function addBillingEvent(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 201, { data: await repo(req).addBillingEvent(tenantId, req.body || {}, actor(req)) });
}

async function listBillingEvents(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listBillingEvents(tenantId) });
}

// ---- Sprint 5: Modules ----
async function listModules(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listModules(tenantId) });
}

async function setModule(req, res, tenantId, moduleKey) {
  if (!isPlatformAdmin(req)) return deny(res);
  const result = await repo(req).setModule(tenantId, moduleKey, req.body || {}, actor(req));
  return sendJson(res, 200, { data: result });
}

// ---- Sprint 6: Branding & White-label ----
async function updateBranding(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).updateBranding(tenantId, req.body || {}, actor(req)) });
}

async function updateWhiteLabel(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).updateWhiteLabel(tenantId, req.body || {}, actor(req)) });
}

// ---- Sprint 7: OAuth & Webhooks ----
async function createOAuthClient(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 201, { data: await repo(req).createOAuthClient(tenantId, req.body || {}, actor(req)) });
}

async function listOAuthClients(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listOAuthClients(tenantId) });
}

async function revokeOAuthClient(req, res, tenantId, clientId) {
  if (!isPlatformAdmin(req)) return deny(res);
  const result = await repo(req).revokeOAuthClient(tenantId, clientId, actor(req));
  if (!result) return sendJson(res, 404, { error: { code: 'not_found', message: 'OAuth client not found' } });
  return sendJson(res, 200, { data: result });
}

async function createWebhook(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 201, { data: await repo(req).createWebhook(tenantId, req.body || {}, actor(req)) });
}

async function listWebhooks(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listWebhooks(tenantId) });
}

async function deleteWebhook(req, res, tenantId, webhookId) {
  if (!isPlatformAdmin(req)) return deny(res);
  const result = await repo(req).deleteWebhook(tenantId, webhookId, actor(req));
  if (!result) return sendJson(res, 404, { error: { code: 'not_found', message: 'Webhook not found' } });
  return sendJson(res, 200, { data: result });
}

// ---- Sprint 8: Usage & Monitoring ----
async function getUsageStats(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getUsageStats(tenantId) });
}

async function getHealthCheck(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).getHealthCheck(tenantId) });
}

// ---- Sprint 9: Audit Center ----
async function searchAudit(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  const url = new URL(req.url, 'http://localhost');
  const filters = {
    action: url.searchParams.get('action') || '',
    actorId: url.searchParams.get('actorId') || '',
    from: url.searchParams.get('from') || '',
    to: url.searchParams.get('to') || '',
    limit: url.searchParams.get('limit') || 200
  };
  return sendJson(res, 200, { data: await repo(req).searchAudit(tenantId, filters) });
}

async function exportAudit(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  const data = await repo(req).exportAudit(tenantId, req.body || {});
  return sendJson(res, 200, { data });
}

// ---- Sprint 10: Recovery ----
async function listDeletedTenants(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listDeletedTenants() });
}

async function listDeletedOwners(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await repo(req).listDeletedOwners(tenantId) });
}

async function permanentPurge(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  const result = await repo(req).permanentPurge(tenantId, actor(req));
  if (!result) return sendJson(res, 400, { error: { code: 'invalid_state', message: 'Tenant must be in deleted state before purge' } });
  return sendJson(res, 200, { data: result });
}

// ---- URL Dispatcher ----
function dispatch(req, res) {
  const base = '/api/v1/platform/tmc';
  if (!req.url.startsWith(base)) return false;

  const path = req.url.replace(base, '').split('?')[0];
  const method = req.method;

  // POST /api/v1/platform/tmc/tenants
  if (path === '/tenants' && method === 'POST') { createTenant(req, res); return true; }

  // POST /api/v1/platform/tmc/transfer-owner
  if (path === '/transfer-owner' && method === 'POST') { transferOwner(req, res); return true; }

  // POST /api/v1/platform/tmc/bulk-status
  if (path === '/bulk-status' && method === 'POST') { bulkStatus(req, res); return true; }

  // GET /api/v1/platform/tmc/recovery/tenants
  if (path === '/recovery/tenants' && method === 'GET') { listDeletedTenants(req, res); return true; }

  // GET /api/v1/platform/tmc/impersonation/sessions
  if (path === '/impersonation/sessions' && method === 'GET') { listImpersonationSessions(req, res, ''); return true; }

  // POST /api/v1/platform/tmc/impersonation/sessions/:id/end
  const endMatch = path.match(/^\/impersonation\/sessions\/([^/]+)\/end$/);
  if (endMatch && method === 'POST') { endImpersonation(req, res, endMatch[1]); return true; }

  // Tenant-scoped routes: /api/v1/platform/tmc/:tenantId/...
  const tenantMatch = path.match(/^\/([^/]+)(\/.*)?$/);
  if (!tenantMatch) return false;
  const tenantId = decodeURIComponent(tenantMatch[1]);
  const sub = tenantMatch[2] || '';

  // Impersonation
  const impMatch = sub.match(/^\/impersonation\/owners\/([^/]+)\/start$/);
  if (impMatch && method === 'POST') { startImpersonation(req, res, tenantId, impMatch[1]); return true; }
  if (sub === '/impersonation/sessions' && method === 'GET') { listImpersonationSessions(req, res, tenantId); return true; }
  if (sub === '/impersonation/terminate-all' && method === 'POST') { terminateAllSessions(req, res, tenantId); return true; }

  // Subscription & Billing
  if (sub === '/subscription' && method === 'PATCH') { updateSubscription(req, res, tenantId); return true; }
  if (sub === '/billing/events' && method === 'POST') { addBillingEvent(req, res, tenantId); return true; }
  if (sub === '/billing/events' && method === 'GET') { listBillingEvents(req, res, tenantId); return true; }

  // Modules
  if (sub === '/modules' && method === 'GET') { listModules(req, res, tenantId); return true; }
  const modMatch = sub.match(/^\/modules\/([^/]+)$/);
  if (modMatch && method === 'PUT') { setModule(req, res, tenantId, decodeURIComponent(modMatch[1])); return true; }

  // Branding & White-label
  if (sub === '/branding' && method === 'PATCH') { updateBranding(req, res, tenantId); return true; }
  if (sub === '/white-label' && method === 'PATCH') { updateWhiteLabel(req, res, tenantId); return true; }

  // OAuth Clients
  if (sub === '/oauth-clients' && method === 'GET') { listOAuthClients(req, res, tenantId); return true; }
  if (sub === '/oauth-clients' && method === 'POST') { createOAuthClient(req, res, tenantId); return true; }
  const oauthRevokeMatch = sub.match(/^\/oauth-clients\/([^/]+)\/revoke$/);
  if (oauthRevokeMatch && method === 'POST') { revokeOAuthClient(req, res, tenantId, oauthRevokeMatch[1]); return true; }

  // Webhooks
  if (sub === '/webhooks' && method === 'GET') { listWebhooks(req, res, tenantId); return true; }
  if (sub === '/webhooks' && method === 'POST') { createWebhook(req, res, tenantId); return true; }
  const webhookDelMatch = sub.match(/^\/webhooks\/([^/]+)$/);
  if (webhookDelMatch && method === 'DELETE') { deleteWebhook(req, res, tenantId, webhookDelMatch[1]); return true; }

  // Usage & Health
  if (sub === '/usage' && method === 'GET') { getUsageStats(req, res, tenantId); return true; }
  if (sub === '/health' && method === 'GET') { getHealthCheck(req, res, tenantId); return true; }

  // Audit
  if (sub === '/audit' && method === 'GET') { searchAudit(req, res, tenantId); return true; }
  if (sub === '/audit/export' && method === 'POST') { exportAudit(req, res, tenantId); return true; }

  // Recovery
  if (sub === '/deleted-owners' && method === 'GET') { listDeletedOwners(req, res, tenantId); return true; }
  if (sub === '/purge' && method === 'POST') { permanentPurge(req, res, tenantId); return true; }

  return false;
}

module.exports = {
  dispatch,
  createTenant, transferOwner, bulkStatus,
  startImpersonation, endImpersonation, listImpersonationSessions, terminateAllSessions,
  updateSubscription, addBillingEvent, listBillingEvents,
  listModules, setModule,
  updateBranding, updateWhiteLabel,
  createOAuthClient, listOAuthClients, revokeOAuthClient,
  createWebhook, listWebhooks, deleteWebhook,
  getUsageStats, getHealthCheck,
  searchAudit, exportAudit,
  listDeletedTenants, listDeletedOwners, permanentPurge
};
