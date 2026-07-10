const { sendJson } = require('../utils/http');
function repo(req) { return req.context.repositories.financeRevenueOps; }
function tenant(req) { return req.body.tenantId || req.context.tenantId || ''; }
function wrap(promise, res, status = 200) { Promise.resolve(promise).then(data => sendJson(res, status, { data })).catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } })); }
module.exports = {
  createPeriod(req, res) { wrap(repo(req).createPeriod({ ...req.body, tenantId: tenant(req) }), res, 201); },
  lockPeriod(req, res, id) { wrap(repo(req).lockPeriod(id), res); },
  closePeriod(req, res, id) { wrap(repo(req).closePeriod(id), res); },
  createRevenueSchedule(req, res) { wrap(repo(req).createRevenueSchedule({ ...req.body, tenantId: tenant(req) }), res, 201); },
  activateSchedule(req, res, id) { wrap(repo(req).activateSchedule(id), res); },
  recognizeRevenue(req, res, id) { wrap(repo(req).recognizeRevenue(id, req.body.amountCents || 0), res); },
  createTaxProfile(req, res) { wrap(repo(req).createTaxProfile({ ...req.body, tenantId: tenant(req) }), res, 201); },
  validateTaxProfile(req, res, id) { wrap(repo(req).validateTaxProfile(id), res); },
  createRefund(req, res) { wrap(repo(req).createRefund({ ...req.body, tenantId: tenant(req) }), res, 201); },
  approveRefund(req, res, id) { wrap(repo(req).approveRefund(id, req.body.approvedBy || req.context.userId || ''), res); },
  processRefund(req, res, id) { wrap(repo(req).processRefund(id, req.body.providerRefundId || ''), res); },
  createPayout(req, res) { wrap(repo(req).createPayout({ ...req.body, tenantId: tenant(req) }), res, 201); },
  approvePayout(req, res, id) { wrap(repo(req).approvePayout(id, req.body.approvedBy || req.context.userId || ''), res); },
  payPayout(req, res, id) { wrap(repo(req).payPayout(id), res); },
  createLedgerEntry(req, res) { wrap(repo(req).createLedgerEntry({ ...req.body, tenantId: tenant(req) }), res, 201); },
  postLedgerEntry(req, res, id) { wrap(repo(req).postLedgerEntry(id), res); },
  createReconciliation(req, res) { wrap(repo(req).createReconciliation({ ...req.body, tenantId: tenant(req) }), res, 201); },
  startReconciliation(req, res, id) { wrap(repo(req).startReconciliation(id), res); },
  completeReconciliation(req, res, id) { wrap(repo(req).completeReconciliation(id, req.body.expectedCents || 0, req.body.actualCents || 0), res); },
  ledgerBalanced(req, res) { wrap(repo(req).ledgerBalanced(tenant(req)), res); },
  metrics(req, res) { wrap(repo(req).metrics(tenant(req)), res); }
};
