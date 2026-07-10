const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.operationalRisks; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    status: req.body.status || '',
    category: req.body.category || '',
    residualLevel: req.body.residualLevel || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listRisks(req, res) { wrap(repo(req).listRisks(filters(req)), res); },
  createRisk(req, res) { wrap(repo(req).createRisk({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  closeRisk(req, res, id) { wrap(repo(req).closeRisk(id), res); },
  createMitigationPlan(req, res, riskId) { wrap(repo(req).createMitigationPlan({ ...req.body, riskId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listMitigationPlans(req, res, riskId) { wrap(repo(req).listMitigationPlans(riskId), res); },
  completeMitigationPlan(req, res, id) { wrap(repo(req).completeMitigationPlan(id), res); },
  createKri(req, res, riskId) { wrap(repo(req).createKri({ ...req.body, riskId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listKris(req, res, riskId) { wrap(repo(req).listKris(riskId), res); },
  updateKriValue(req, res, id) { wrap(repo(req).updateKriValue(id, req.body.currentValue), res); },
  createReview(req, res, riskId) { wrap(repo(req).createReview({ ...req.body, riskId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listReviews(req, res, riskId) { wrap(repo(req).listReviews(riskId), res); },
  completeReview(req, res, id) { wrap(repo(req).completeReview(id, req.body.notes || ''), res); },
  createAcceptance(req, res, riskId) { wrap(repo(req).createAcceptance({ ...req.body, riskId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  approveAcceptance(req, res, id) { wrap(repo(req).approveAcceptance(id, req.body.approvedBy || req.context.userId || ''), res); },
  rejectAcceptance(req, res, id) { wrap(repo(req).rejectAcceptance(id, req.body.approvedBy || req.context.userId || ''), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
