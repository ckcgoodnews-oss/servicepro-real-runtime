const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.technicians; }
function tenant(req) { return req.context.tenantId; }

function list(req, res) {
  Promise.resolve(repo(req).list(tenant(req))).then(data => sendJson(res, 200, { data }));
}

function create(req, res) {
  Promise.resolve()
    .then(() => repo(req).create(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

module.exports = { list, create };
