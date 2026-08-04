const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.tasks; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = {
    status: url.searchParams.get('status') || '',
    assigned_to: url.searchParams.get('assigned_to') || '',
    entity_type: url.searchParams.get('entity_type') || '',
    entity_id: url.searchParams.get('entity_id') || '',
    task_type: url.searchParams.get('task_type') || '',
    priority: url.searchParams.get('priority') || ''
  };
  for (const key of Object.keys(filters)) if (!filters[key]) delete filters[key];
  Promise.resolve(repo(req).list(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Task not found' } }));
}

function create(req, res) {
  const { title } = req.body || {};
  if (!title) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'title is required' } });
  const input = { ...req.body, owner_id: req.body.owner_id || req.user?.email || null };
  Promise.resolve(repo(req).create(tenant(req), input))
    .then(data => sendJson(res, 201, { data }));
}

function update(req, res, id) {
  Promise.resolve(repo(req).update(tenant(req), id, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Task not found' } }));
}

function remove(req, res, id) {
  Promise.resolve(repo(req).delete(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Task not found' } }));
}

function overdue(req, res) {
  Promise.resolve(repo(req).overdue(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function countByStatus(req, res) {
  Promise.resolve(repo(req).countByStatus(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

module.exports = { list, get, create, update, remove, overdue, countByStatus };
