const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.communications; }

function filtersFromBody(req) {
  return {
    customerId: req.body.customerId || '',
    jobId: req.body.jobId || '',
    estimateId: req.body.estimateId || '',
    invoiceId: req.body.invoiceId || '',
    channel: req.body.channel || '',
    direction: req.body.direction || '',
    status: req.body.status || ''
  };
}

function list(req, res) {
  Promise.resolve(repo(req).list(tenant(req), filtersFromBody(req))).then(data => sendJson(res, 200, { data }));
}

function timeline(req, res) {
  Promise.resolve(repo(req).timeline(tenant(req), filtersFromBody(req))).then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Communication not found' } });
    return sendJson(res, 200, { data });
  });
}

function create(req, res) {
  Promise.resolve(repo(req).create(tenant(req), { ...req.body, createdBy: req.context.userId || req.body.createdBy || '' }))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function updateStatus(req, res, id) {
  Promise.resolve(repo(req).updateStatus(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Communication not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function listForCustomer(req, res, customerId) {
  Promise.resolve(repo(req).list(tenant(req), { customerId })).then(data => sendJson(res, 200, { data }));
}

function timelineForCustomer(req, res, customerId) {
  Promise.resolve(repo(req).timeline(tenant(req), { customerId })).then(data => sendJson(res, 200, { data }));
}

module.exports = { list, timeline, get, create, updateStatus, listForCustomer, timelineForCustomer };
