const { sendJson } = require('../utils/http');
function repo(req) { return req.context.repositories.goLiveHypercare; }
function tenant(req) { return req.body.tenantId || req.context.tenantId || ''; }
function wrap(promise, res, status = 200) { Promise.resolve(promise).then(data => sendJson(res, status, { data })).catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } })); }
module.exports = {
  createChecklistItem(req, res) { wrap(repo(req).createChecklistItem({ ...req.body, tenantId: tenant(req) }), res, 201); },
  completeChecklistItem(req, res, id) { wrap(repo(req).completeChecklistItem(id, req.body.evidenceUrl || ''), res); },
  waiveChecklistItem(req, res, id) { wrap(repo(req).waiveChecklistItem(id, req.body.reason || ''), res); },
  createCutoverPlan(req, res) { wrap(repo(req).createCutoverPlan({ ...req.body, tenantId: tenant(req) }), res, 201); },
  approveCutover(req, res, id) { wrap(repo(req).approveCutover(id, req.body.approvedBy || req.context.userId || ''), res); },
  startCutover(req, res, id) { wrap(repo(req).startCutover(id), res); },
  completeCutover(req, res, id) { wrap(repo(req).completeCutover(id), res); },
  rollbackCutover(req, res, id) { wrap(repo(req).rollbackCutover(id), res); },
  createStep(req, res, cutoverPlanId) { wrap(repo(req).createStep({ ...req.body, cutoverPlanId, tenantId: tenant(req) }), res, 201); },
  startStep(req, res, id) { wrap(repo(req).startStep(id), res); },
  completeStep(req, res, id) { wrap(repo(req).completeStep(id), res); },
  createDns(req, res) { wrap(repo(req).createDns({ ...req.body, tenantId: tenant(req) }), res, 201); },
  validateDns(req, res, id) { wrap(repo(req).validateDns(id), res); },
  startDnsPropagation(req, res, id) { wrap(repo(req).startDnsPropagation(id), res); },
  completeDns(req, res, id) { wrap(repo(req).completeDns(id), res); },
  createCommunication(req, res) { wrap(repo(req).createCommunication({ ...req.body, tenantId: tenant(req) }), res, 201); },
  approveCommunication(req, res, id) { wrap(repo(req).approveCommunication(id, req.body.approvedBy || req.context.userId || ''), res); },
  sendCommunication(req, res, id) { wrap(repo(req).sendCommunication(id), res); },
  createRollbackDecision(req, res) { wrap(repo(req).createRollbackDecision({ ...req.body, tenantId: tenant(req) }), res, 201); },
  recommendRollback(req, res, id) { wrap(repo(req).recommendRollback(id, req.body.reason || '', req.body.impactSummary || ''), res); },
  approveRollback(req, res, id) { wrap(repo(req).approveRollback(id, req.body.decidedBy || req.context.userId || ''), res); },
  executeRollback(req, res, id) { wrap(repo(req).executeRollback(id), res); },
  createIssue(req, res) { wrap(repo(req).createIssue({ ...req.body, tenantId: tenant(req) }), res, 201); },
  resolveIssue(req, res, id) { wrap(repo(req).resolveIssue(id, req.body.resolution || ''), res); },
  closeIssue(req, res, id) { wrap(repo(req).closeIssue(id), res); },
  createDailyReport(req, res) { wrap(repo(req).createDailyReport({ ...req.body, tenantId: tenant(req) }), res, 201); },
  publishDailyReport(req, res, id) { wrap(repo(req).publishDailyReport(id, req.body.publishedBy || req.context.userId || ''), res); },
  goLiveReady(req, res) { wrap(repo(req).goLiveReady(tenant(req)), res); },
  metrics(req, res) { wrap(repo(req).metrics(tenant(req)), res); }
};
