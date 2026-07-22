const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.dispatch; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) {
  Promise.resolve(repo(req).list(tenant(req))).then(data => sendJson(res, 200, { data }));
}

function assign(req, res) {
  Promise.resolve()
    .then(() => repo(req).assign(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function updateStatus(req, res, id) {
  const status = req.body.status || 'assigned';
  Promise.resolve(repo(req).updateStatus(tenant(req), id, status)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Dispatch assignment not found' } });
    sendJson(res, 200, { data });
  });
}

module.exports = { list, assign, updateStatus };
