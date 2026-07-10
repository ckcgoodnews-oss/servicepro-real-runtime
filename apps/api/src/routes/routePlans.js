const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.routePlans; }

function filters(req) {
  return {
    routeDate: req.body.routeDate || '',
    technicianId: req.body.technicianId || ''
  };
}

function listPlans(req, res) {
  Promise.resolve(repo(req).listPlans(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}
function createPlan(req, res) {
  Promise.resolve(repo(req).createPlan(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function getPlan(req, res, id) {
  Promise.resolve(repo(req).findPlanById(tenant(req), id)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Route plan not found' } });
    return sendJson(res, 200, { data });
  });
}
function updatePlan(req, res, id) {
  Promise.resolve(repo(req).updatePlan(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Route plan not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listStops(req, res, routePlanId) {
  Promise.resolve(repo(req).listStops(tenant(req), routePlanId)).then(data => sendJson(res, 200, { data }));
}
function createStop(req, res, routePlanId) {
  Promise.resolve(repo(req).createStop(tenant(req), { ...req.body, routePlanId }))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function optimize(req, res, routePlanId) {
  Promise.resolve(repo(req).optimize(tenant(req), routePlanId))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Route plan not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function summary(req, res, routePlanId) {
  Promise.resolve(repo(req).summary(tenant(req), routePlanId)).then(data => sendJson(res, 200, { data }));
}

module.exports = { listPlans, createPlan, getPlan, updatePlan, listStops, createStop, optimize, summary };
