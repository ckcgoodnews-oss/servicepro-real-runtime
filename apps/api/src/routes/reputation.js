const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.reputation; }

function filters(req) {
  return {
    customerId: req.body.customerId || '',
    jobId: req.body.jobId || '',
    platform: req.body.platform || '',
    status: req.body.status || ''
  };
}

function listSites(req, res) {
  Promise.resolve(repo(req).listSites(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function createSite(req, res) {
  Promise.resolve(repo(req).createSite(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listCampaigns(req, res) {
  Promise.resolve(repo(req).listCampaigns(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function createCampaign(req, res) {
  Promise.resolve(repo(req).createCampaign(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listRequests(req, res) {
  Promise.resolve(repo(req).listRequests(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}
function createRequest(req, res) {
  Promise.resolve(repo(req).createRequest(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function markRequestSent(req, res, id) {
  Promise.resolve(repo(req).markRequestSent(tenant(req), id, req.body.sentAt))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Review request not found' } }));
}
function listCaptures(req, res) {
  Promise.resolve(repo(req).listCaptures(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}
function createCapture(req, res) {
  Promise.resolve(repo(req).createCapture(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function markResponded(req, res, id) {
  Promise.resolve(repo(req).markResponded(tenant(req), id, req.body.responseText || ''))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Review capture not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function escalate(req, res, id) {
  Promise.resolve(repo(req).escalate(tenant(req), id, req.body.reason || 'Manual escalation'))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Review capture not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function summary(req, res) {
  Promise.resolve(repo(req).summary(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}

module.exports = {
  listSites,
  createSite,
  listCampaigns,
  createCampaign,
  listRequests,
  createRequest,
  markRequestSent,
  listCaptures,
  createCapture,
  markResponded,
  escalate,
  summary
};
