const { sendJson } = require('../utils/http');

function list(req, res) {
  Promise.resolve(req.context.repositories.integrity.list(req.context.tenantId))
    .then(data => sendJson(res, 200, { data }));
}

function run(req, res) {
  Promise.resolve(req.context.repositories.integrity.run(req.context.tenantId))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

module.exports = { list, run };
