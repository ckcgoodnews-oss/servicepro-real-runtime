const { sendJson } = require('../utils/http');

function list(req, res) {
  const limit = Number(req.body.limit || 100);
  Promise.resolve(req.context.repositories.audit.list(req.context.tenantId, limit))
    .then(data => sendJson(res, 200, { data }));
}

function create(req, res) {
  Promise.resolve(req.context.repositories.audit.create(req.context.tenantId, {
    ...req.body,
    actorId: req.body.actorId || req.context.userId || '',
    actorType: req.body.actorType || 'user'
  }))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

module.exports = { list, create };
