const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function agreements(req) { return req.context.repositories.serviceAgreements; }
function visits(req) { return req.context.repositories.agreementVisits; }

function list(req, res) {
  Promise.resolve(agreements(req).list(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function get(req, res, id) {
  Promise.resolve(agreements(req).findById(tenant(req), id)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Service agreement not found' } });
    return sendJson(res, 200, { data });
  });
}
function create(req, res) {
  Promise.resolve(agreements(req).create(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function update(req, res, id) {
  Promise.resolve(agreements(req).update(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Service agreement not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function dueForRenewal(req, res) {
  const today = req.body.today || new Date().toISOString().slice(0, 10);
  Promise.resolve(agreements(req).dueForRenewal(tenant(req), today)).then(data => sendJson(res, 200, { data }));
}
function listVisits(req, res, agreementId) {
  Promise.resolve(visits(req).listForAgreement(tenant(req), agreementId)).then(data => sendJson(res, 200, { data }));
}
function createVisit(req, res, agreementId) {
  Promise.resolve().then(async () => {
    const agreement = await agreements(req).findById(tenant(req), agreementId);
    if (!agreement) {
      const err = new Error('Service agreement not found');
      err.status = 404;
      err.code = 'not_found';
      throw err;
    }
    return visits(req).create(tenant(req), { ...req.body, agreementId, customerId: agreement.customerId });
  }).then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function generateNextVisit(req, res, agreementId) {
  Promise.resolve().then(async () => {
    const agreement = await agreements(req).findById(tenant(req), agreementId);
    if (!agreement) {
      const err = new Error('Service agreement not found');
      err.status = 404;
      err.code = 'not_found';
      throw err;
    }
    const existing = await visits(req).listForAgreement(tenant(req), agreementId);
    return visits(req).generateNextVisit(tenant(req), agreement, existing.length);
  }).then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = { list, get, create, update, dueForRenewal, listVisits, createVisit, generateNextVisit };
