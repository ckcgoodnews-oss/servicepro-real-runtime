const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.sla; }

function listPolicies(req, res) {
  Promise.resolve(repo(req).listPolicies(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function createPolicy(req, res) {
  Promise.resolve(repo(req).createPolicy(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listTimers(req, res) {
  Promise.resolve(repo(req).listTimers(tenant(req), { jobId: req.body.jobId || '', status: req.body.status || '' })).then(data => sendJson(res, 200, { data }));
}
function createTimer(req, res) {
  Promise.resolve(repo(req).createTimer(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function createTimerFromPolicy(req, res, policyId) {
  Promise.resolve(repo(req).createTimerFromPolicy(tenant(req), policyId, req.body))
    .then(data => data ? sendJson(res, 201, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'SLA policy not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function markResponded(req, res, id) {
  Promise.resolve(repo(req).markResponded(tenant(req), id, req.body.respondedAt))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'SLA timer not found' } }));
}
function markResolved(req, res, id) {
  Promise.resolve(repo(req).markResolved(tenant(req), id, req.body.resolvedAt))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'SLA timer not found' } }));
}
function evaluate(req, res) {
  Promise.resolve(repo(req).evaluate(tenant(req), req.body.nowIso)).then(data => sendJson(res, 200, { data }));
}
function markBreaches(req, res) {
  Promise.resolve(repo(req).markBreaches(tenant(req), req.body.nowIso)).then(data => sendJson(res, 200, { data }));
}

module.exports = {
  listPolicies,
  createPolicy,
  listTimers,
  createTimer,
  createTimerFromPolicy,
  markResponded,
  markResolved,
  evaluate,
  markBreaches
};
