const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.recordAssociations; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const entityType = url.searchParams.get('entity_type');
  const entityId = url.searchParams.get('entity_id');
  if (!entityType || !entityId) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'entity_type and entity_id are required' } });
  }
  Promise.resolve(repo(req).listForEntity(tenant(req), entityType, entityId))
    .then(data => sendJson(res, 200, { data }));
}

function create(req, res) {
  const { source_type, source_id, target_type, target_id } = req.body || {};
  if (!source_type || !source_id || !target_type || !target_id) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'source_type, source_id, target_type, and target_id are required' } });
  }
  Promise.resolve(repo(req).create(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }));
}

function remove(req, res, id) {
  Promise.resolve(repo(req).removeById(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Association not found' } }));
}

module.exports = { list, create, remove };
