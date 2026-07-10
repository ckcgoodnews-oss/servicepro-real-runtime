const { sendJson } = require('../utils/http');
function repo(req) { return req.context.repositories.customerSuccessOnboarding; }
function tenant(req) { return req.body.tenantId || req.context.tenantId || ''; }
function wrap(promise, res, status = 200) { Promise.resolve(promise).then(data => sendJson(res, status, { data })).catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } })); }
module.exports = {
  createCohort(req, res) { wrap(repo(req).createCohort({ ...req.body, tenantId: tenant(req) }), res, 201); },
  activateCohort(req, res, id) { wrap(repo(req).activateCohort(id), res); },
  completeCohort(req, res, id) { wrap(repo(req).completeCohort(id), res); },
  createPlan(req, res) { wrap(repo(req).createPlan({ ...req.body, tenantId: tenant(req) }), res, 201); },
  startPlan(req, res, id) { wrap(repo(req).startPlan(id), res); },
  completePlan(req, res, id) { wrap(repo(req).completePlan(id), res); },
  blockPlan(req, res, id) { wrap(repo(req).blockPlan(id, req.body.blockerSummary || ''), res); },
  createTask(req, res, planId) { wrap(repo(req).createTask({ ...req.body, planId, tenantId: tenant(req) }), res, 201); },
  startTask(req, res, id) { wrap(repo(req).startTask(id), res); },
  completeTask(req, res, id) { wrap(repo(req).completeTask(id), res); },
  createMetric(req, res) { wrap(repo(req).createMetric({ ...req.body, tenantId: tenant(req) }), res, 201); },
  createFeedback(req, res) { wrap(repo(req).createFeedback({ ...req.body, tenantId: tenant(req) }), res, 201); },
  reviewFeedback(req, res, id) { wrap(repo(req).reviewFeedback(id, req.body.reviewedBy || req.context.userId || ''), res); },
  resolveFeedback(req, res, id) { wrap(repo(req).resolveFeedback(id, req.body.resolution || ''), res); },
  createEscalation(req, res) { wrap(repo(req).createEscalation({ ...req.body, tenantId: tenant(req) }), res, 201); },
  startEscalation(req, res, id) { wrap(repo(req).startEscalation(id, req.body.owner || req.context.userId || ''), res); },
  resolveEscalation(req, res, id) { wrap(repo(req).resolveEscalation(id, req.body.resolution || ''), res); },
  closeEscalation(req, res, id) { wrap(repo(req).closeEscalation(id), res); },
  createSuccessPlan(req, res) { wrap(repo(req).createSuccessPlan({ ...req.body, tenantId: tenant(req) }), res, 201); },
  activateSuccessPlan(req, res, id) { wrap(repo(req).activateSuccessPlan(id), res); },
  markSuccessPlanAtRisk(req, res, id) { wrap(repo(req).markSuccessPlanAtRisk(id, req.body.risk || ''), res); },
  metrics(req, res) { wrap(repo(req).metrics(tenant(req)), res); }
};
