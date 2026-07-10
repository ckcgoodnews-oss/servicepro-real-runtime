const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.tenantSecurity; }

function filters(req) {
  return {
    status: req.body.status || '',
    userId: req.body.userId || '',
    result: req.body.result || '',
    action: req.body.action || ''
  };
}

function listPolicies(req, res) {
  Promise.resolve(repo(req).listPolicies(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}

function createPolicy(req, res) {
  Promise.resolve(repo(req).createPolicy(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function getPolicy(req, res, id) {
  Promise.resolve(repo(req).findPolicyById(tenant(req), id)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Tenant security policy not found' } });
    return sendJson(res, 200, { data });
  });
}

function updatePolicy(req, res, id) {
  Promise.resolve(repo(req).updatePolicy(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Tenant security policy not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function evaluate(req, res) {
  Promise.resolve(repo(req).evaluate(tenant(req), { ...req.body, userId: req.body.userId || req.context.userId || '' }))
    .then(data => sendJson(res, 200, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function listDecisions(req, res) {
  Promise.resolve(repo(req).listDecisions(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}

function summary(req, res) {
  Promise.resolve(repo(req).summary(tenant(req))).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'No active tenant security policy found' } });
    return sendJson(res, 200, { data });
  });
}

module.exports = {
  listPolicies,
  createPolicy,
  getPolicy,
  updatePolicy,
  evaluate,
  listDecisions,
  summary
};
