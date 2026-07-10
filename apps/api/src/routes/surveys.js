const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.surveys; }

function filters(req) {
  return {
    customerId: req.body.customerId || '',
    entityType: req.body.entityType || '',
    entityId: req.body.entityId || '',
    status: req.body.status || ''
  };
}

function listTemplates(req, res) {
  Promise.resolve(repo(req).listTemplates(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function createTemplate(req, res) {
  Promise.resolve(repo(req).createTemplate(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listSends(req, res) {
  Promise.resolve(repo(req).listSends(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}
function createSend(req, res) {
  Promise.resolve(repo(req).createSend(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function markSent(req, res, id) {
  Promise.resolve(repo(req).markSent(tenant(req), id, req.body.sentAt))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Survey send not found' } }));
}
function createResponse(req, res) {
  Promise.resolve(repo(req).createResponse(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listResponses(req, res) {
  Promise.resolve(repo(req).listResponses(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}
function summary(req, res) {
  Promise.resolve(repo(req).summary(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}

module.exports = {
  listTemplates,
  createTemplate,
  listSends,
  createSend,
  markSent,
  createResponse,
  listResponses,
  summary
};
