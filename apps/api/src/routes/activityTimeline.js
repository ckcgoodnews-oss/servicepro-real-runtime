const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.activityTimeline; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const entityType = url.searchParams.get('entity_type');
  const entityId = url.searchParams.get('entity_id');
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);

  if (!entityType || !entityId) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'entity_type and entity_id are required' } });
  }
  const filters = { limit, activity_type: url.searchParams.get('activity_type') || '' };
  for (const key of Object.keys(filters)) if (!filters[key]) delete filters[key];

  Promise.resolve(repo(req).list(tenant(req), entityType, entityId, filters))
    .then(data => sendJson(res, 200, { data }));
}

function create(req, res) {
  const { entity_type, entity_id, activity_type } = req.body || {};
  if (!entity_type || !entity_id || !activity_type) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'entity_type, entity_id, and activity_type are required' } });
  }
  const input = { ...req.body, performed_by: req.body.performed_by || req.user?.email || null };
  Promise.resolve(repo(req).create(tenant(req), input))
    .then(data => sendJson(res, 201, { data }));
}

function recent(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  Promise.resolve(repo(req).recent(tenant(req), limit))
    .then(data => sendJson(res, 200, { data }));
}

module.exports = { list, create, recent };
