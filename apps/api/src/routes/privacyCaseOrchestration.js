const { sendJson } = require('../utils/http');
function repo(req) { return req.context.repositories.privacyCaseOrchestration; }
function tenant(req) { return req.body.tenantId || req.context.tenantId || ''; }
function wrap(value, res, status = 200) { Promise.resolve(value).then(data => sendJson(res, status, { data })).catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } })); }
module.exports = {
  createCase(req, res) { wrap(repo(req).createCase({ ...req.body, tenantId: tenant(req) }), res, 201); },
  verify(req, res, id) { wrap(repo(req).verify(id, req.body.evidence), res); },
  extend(req, res, id) { wrap(repo(req).extend(id, req.body.days, req.body.reason), res); },
  close(req, res, id) { wrap(repo(req).close(id, req.body.outcome), res); },
  createTask(req, res) { wrap(repo(req).createTask({ ...req.body, tenantId: tenant(req) }), res, 201); },
  completeTask(req, res, id) { wrap(repo(req).completeTask(id, req.body.evidence || {}), res); },
  createCommunication(req, res) { wrap(repo(req).createCommunication({ ...req.body, tenantId: tenant(req) }), res, 201); },
  metrics(req, res) { wrap(repo(req).metrics(tenant(req)), res); }
};
