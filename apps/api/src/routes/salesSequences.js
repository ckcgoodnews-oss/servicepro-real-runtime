const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');
function repo(req) { return req.context.repositories.salesSequences; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) { Promise.resolve(repo(req).list(tenant(req), {})).then(data => sendJson(res, 200, { data })); }
function get(req, res, id) { Promise.resolve(repo(req).findById(tenant(req), id)).then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Sequence not found' } })); }
function create(req, res) {
  const { name, steps } = req.body || {};
  if (!name) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'name is required' } });
  Promise.resolve(repo(req).create(tenant(req), req.body)).then(data => sendJson(res, 201, { data }));
}
function update(req, res, id) { Promise.resolve(repo(req).update(tenant(req), id, req.body || {})).then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Sequence not found' } })); }
function remove(req, res, id) { Promise.resolve(repo(req).delete(tenant(req), id)).then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Sequence not found' } })); }
function enroll(req, res, id) {
  const { contact_id } = req.body || {};
  if (!contact_id) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'contact_id is required' } });
  Promise.resolve(repo(req).enroll(tenant(req), id, contact_id)).then(data => sendJson(res, 201, { data }));
}
function listEnrollments(req, res, id) { Promise.resolve(repo(req).listEnrollments(tenant(req), id, {})).then(data => sendJson(res, 200, { data })); }
function unenroll(req, res, enrollmentId) { Promise.resolve(repo(req).unenroll(tenant(req), enrollmentId)).then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Enrollment not found' } })); }

module.exports = { list, get, create, update, remove, enroll, listEnrollments, unenroll };
