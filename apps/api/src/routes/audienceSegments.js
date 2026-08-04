const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.audienceSegments; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const filters = { segment_type: url.searchParams.get('segment_type') || '' };
  for (const key of Object.keys(filters)) if (!filters[key]) delete filters[key];
  Promise.resolve(repo(req).list(tenant(req), filters))
    .then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Segment not found' } }));
}

function create(req, res) {
  const { name } = req.body || {};
  if (!name) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'name is required' } });
  Promise.resolve(repo(req).create(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }));
}

function update(req, res, id) {
  Promise.resolve(repo(req).update(tenant(req), id, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Segment not found' } }));
}

function remove(req, res, id) {
  Promise.resolve(repo(req).delete(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Segment not found' } }));
}

function addMember(req, res, id) {
  const { contact_id } = req.body || {};
  if (!contact_id) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'contact_id is required' } });
  Promise.resolve(repo(req).addMember(tenant(req), id, contact_id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Segment not found or not static' } }));
}

function removeMember(req, res, id, contactId) {
  Promise.resolve(repo(req).removeMember(tenant(req), id, contactId))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Segment not found' } }));
}

function evaluate(req, res, id) {
  const contacts = req.context.repositories.crmContacts?.list(tenant(req), {}) || [];
  Promise.resolve(contacts)
    .then(c => repo(req).evaluate(tenant(req), id, c))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Segment not found' } }));
}

module.exports = { list, get, create, update, remove, addMember, removeMember, evaluate };
