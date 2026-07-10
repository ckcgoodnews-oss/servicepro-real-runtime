const { sendJson } = require('../utils/http');
function repo(req) { return req.context.repositories.billingMonetization; }
function tenant(req) { return req.body.tenantId || req.context.tenantId || ''; }
function wrap(promise, res, status = 200) { Promise.resolve(promise).then(data => sendJson(res, status, { data })).catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } })); }
module.exports = {
  createPlan(req, res) { wrap(repo(req).createPlan({ ...req.body, tenantId: tenant(req) }), res, 201); },
  activatePlan(req, res, id) { wrap(repo(req).activatePlan(id), res); },
  retirePlan(req, res, id) { wrap(repo(req).retirePlan(id), res); },
  createEntitlement(req, res, planId) { wrap(repo(req).createEntitlement({ ...req.body, planId, tenantId: tenant(req) }), res, 201); },
  listEntitlements(req, res, planId) { wrap(repo(req).listEntitlements(planId), res); },
  createSubscription(req, res) { wrap(repo(req).createSubscription({ ...req.body, tenantId: tenant(req) }), res, 201); },
  activateSubscription(req, res, id) { wrap(repo(req).activateSubscription(id), res); },
  markSubscriptionPastDue(req, res, id) { wrap(repo(req).markSubscriptionPastDue(id), res); },
  cancelSubscription(req, res, id) { wrap(repo(req).cancelSubscription(id, req.body.reason || ''), res); },
  createInvoice(req, res) { wrap(repo(req).createInvoice({ ...req.body, tenantId: tenant(req) }), res, 201); },
  openInvoice(req, res, id) { wrap(repo(req).openInvoice(id), res); },
  createPayment(req, res) { wrap(repo(req).createPayment({ ...req.body, tenantId: tenant(req) }), res, 201); },
  succeedPayment(req, res, id) { wrap(repo(req).succeedPayment(id, req.body.providerPaymentId || ''), res); },
  failPayment(req, res, id) { wrap(repo(req).failPayment(id, req.body.reason || ''), res); },
  createCredit(req, res) { wrap(repo(req).createCredit({ ...req.body, tenantId: tenant(req) }), res, 201); },
  applyCredit(req, res, id) { wrap(repo(req).applyCredit(id, req.body.invoiceId || '', req.body.amountCents || 0), res); },
  createDunning(req, res) { wrap(repo(req).createDunning({ ...req.body, tenantId: tenant(req) }), res, 201); },
  sendDunning(req, res, id) { wrap(repo(req).sendDunning(id, req.body.message || ''), res); },
  resolveDunning(req, res, id) { wrap(repo(req).resolveDunning(id), res); },
  checkEntitlement(req, res) { wrap(repo(req).checkEntitlement(req.body.customerTenantId || '', req.body.key || ''), res); },
  metrics(req, res) { wrap(repo(req).metrics(tenant(req)), res); }
};
