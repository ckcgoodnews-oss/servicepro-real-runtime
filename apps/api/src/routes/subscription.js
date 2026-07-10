const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.subscription; }
function filters(req) { return { status: req.body.status || '' }; }

function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listPlans(req, res) { wrap(repo(req).listPlans(filters(req)), res); },
  createPlan(req, res) { wrap(repo(req).createPlan(req.body), res, 201); },
  listPlanEntitlements(req, res, planId) { wrap(repo(req).listPlanEntitlements(planId), res); },
  createPlanEntitlement(req, res, planId) { wrap(repo(req).createPlanEntitlement({ ...req.body, planId }), res, 201); },
  listSubscriptions(req, res) { wrap(repo(req).listSubscriptions(tenant(req), filters(req)), res); },
  createSubscription(req, res) { wrap(repo(req).createSubscription(tenant(req), req.body), res, 201); },
  evaluateEntitlement(req, res) { wrap(repo(req).evaluateEntitlement(tenant(req), req.body), res); },
  listMeters(req, res) { wrap(repo(req).listMeters(), res); },
  createMeter(req, res) { wrap(repo(req).createMeter(req.body), res, 201); },
  recordUsage(req, res) { wrap(repo(req).recordUsage(tenant(req), req.body), res, 201); },
  aggregateUsage(req, res) { wrap(repo(req).aggregateUsage(tenant(req), req.body), res); },
  listInvoices(req, res) { wrap(repo(req).listInvoices(tenant(req), filters(req)), res); },
  createInvoice(req, res) { wrap(repo(req).createInvoice(tenant(req), req.body), res, 201); },
  generateInvoice(req, res) { wrap(repo(req).generateInvoice(tenant(req), req.body), res, 201); },
  markInvoicePaid(req, res, id) {
    Promise.resolve(repo(req).markInvoicePaid(tenant(req), id))
      .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Invoice not found' } }))
      .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
  }
};
