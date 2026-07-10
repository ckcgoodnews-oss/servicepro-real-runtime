const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.customerSuccess; }

function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    status: req.body.status || '',
    accountPlanId: req.body.accountPlanId || ''
  };
}

function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listAccountPlans(req, res) { wrap(repo(req).listAccountPlans(filters(req)), res); },
  createAccountPlan(req, res) { wrap(repo(req).createAccountPlan({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listMilestones(req, res, accountPlanId) { wrap(repo(req).listMilestones(accountPlanId), res); },
  createMilestone(req, res, accountPlanId) { wrap(repo(req).createMilestone({ ...req.body, accountPlanId }), res, 201); },
  completeMilestone(req, res, id) { wrap(repo(req).completeMilestone(id), res); },
  listTasks(req, res) { wrap(repo(req).listTasks(filters(req)), res); },
  createTask(req, res) { wrap(repo(req).createTask(req.body), res, 201); },
  completeTask(req, res, id) { wrap(repo(req).completeTask(id), res); },
  listQbrs(req, res, accountPlanId) { wrap(repo(req).listQbrs(accountPlanId), res); },
  createQbr(req, res, accountPlanId) { wrap(repo(req).createQbr({ ...req.body, accountPlanId }), res, 201); },
  completeQbr(req, res, id) { wrap(repo(req).completeQbr(id, req.body.outcomes || []), res); },
  listRenewalRisks(req, res, accountPlanId) { wrap(repo(req).listRenewalRisks(accountPlanId), res); },
  createRenewalRisk(req, res, accountPlanId) { wrap(repo(req).createRenewalRisk({ ...req.body, accountPlanId }), res, 201); },
  resolveRenewalRisk(req, res, id) { wrap(repo(req).resolveRenewalRisk(id), res); },
  score(req, res, accountPlanId) { wrap(repo(req).score(accountPlanId), res); }
};
