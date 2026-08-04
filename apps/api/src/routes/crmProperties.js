const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.crmPropertyDefinitions; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const objectType = url.searchParams.get('object_type') || '';
  Promise.resolve(repo(req).list(tenant(req), objectType || undefined))
    .then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Property definition not found' } }));
}

function create(req, res) {
  const { object_type, name, label, field_type } = req.body || {};
  if (!object_type || !name || !label || !field_type) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'object_type, name, label, and field_type are required' } });
  }
  const validTypes = ['text', 'textarea', 'number', 'currency', 'date', 'datetime', 'select', 'multiselect', 'checkbox', 'email', 'phone', 'url', 'user', 'formula'];
  if (!validTypes.includes(field_type)) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: `field_type must be one of: ${validTypes.join(', ')}` } });
  }
  Promise.resolve(repo(req).create(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }));
}

function update(req, res, id) {
  Promise.resolve(repo(req).update(tenant(req), id, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Property definition not found' } }));
}

function remove(req, res, id) {
  Promise.resolve(repo(req).delete(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Property definition not found' } }));
}

module.exports = { list, get, create, update, remove };
