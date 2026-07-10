const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.warranty; }

function claimFilters(req) {
  return {
    customerId: req.body.customerId || '',
    originalJobId: req.body.originalJobId || '',
    status: req.body.status || ''
  };
}

function listPolicies(req, res) {
  Promise.resolve(repo(req).listPolicies(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function createPolicy(req, res) {
  Promise.resolve(repo(req).createPolicy(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listClaims(req, res) {
  Promise.resolve(repo(req).listClaims(tenant(req), claimFilters(req))).then(data => sendJson(res, 200, { data }));
}
function createClaim(req, res) {
  Promise.resolve(repo(req).createClaim(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function approveClaim(req, res, id) {
  Promise.resolve(repo(req).approveClaim(tenant(req), id, req.body.approvedBy || req.context.userId || ''))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Warranty claim not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function denyClaim(req, res, id) {
  Promise.resolve(repo(req).denyClaim(tenant(req), id, req.body.deniedReason || 'Denied'))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Warranty claim not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function evaluateEligibility(req, res) {
  Promise.resolve(repo(req).evaluateEligibility(tenant(req), req.body)).then(data => sendJson(res, 200, { data }));
}
function listCallbacks(req, res) {
  Promise.resolve(repo(req).listCallbacks(tenant(req), claimFilters(req))).then(data => sendJson(res, 200, { data }));
}
function createCallback(req, res) {
  Promise.resolve(repo(req).createCallback(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function completeCallback(req, res, id) {
  Promise.resolve(repo(req).completeCallback(tenant(req), id, req.body.resolutionNotes || ''))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Callback not found' } }));
}

module.exports = {
  listPolicies,
  createPolicy,
  listClaims,
  createClaim,
  approveClaim,
  denyClaim,
  evaluateEligibility,
  listCallbacks,
  createCallback,
  completeCallback
};
