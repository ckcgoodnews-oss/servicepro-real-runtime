const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.bcdrGovernance; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    biaId: req.body.biaId || '',
    status: req.body.status || '',
    criticality: req.body.criticality || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listBias(req, res) { wrap(repo(req).listBias(filters(req)), res); },
  createBia(req, res) { wrap(repo(req).createBia({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  submitBia(req, res, id) { wrap(repo(req).submitBia(id), res); },
  approveBia(req, res, id) { wrap(repo(req).approveBia(id), res); },
  createPlan(req, res, biaId) { wrap(repo(req).createPlan({ ...req.body, biaId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listPlans(req, res) { wrap(repo(req).listPlans(filters(req)), res); },
  submitPlan(req, res, id) { wrap(repo(req).submitPlan(id), res); },
  approvePlan(req, res, id) { wrap(repo(req).approvePlan(id), res); },
  activatePlan(req, res, id) { wrap(repo(req).activatePlan(id), res); },
  createApproval(req, res, planId) { wrap(repo(req).createApproval({ ...req.body, planId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  approveGate(req, res, id) { wrap(repo(req).approveGate(id, req.body.comments || ''), res); },
  rejectGate(req, res, id) { wrap(repo(req).rejectGate(id, req.body.comments || ''), res); },
  createExercise(req, res, planId) { wrap(repo(req).createExercise({ ...req.body, planId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  startExercise(req, res, id) { wrap(repo(req).startExercise(id), res); },
  completeExercise(req, res, id) { wrap(repo(req).completeExercise(id, req.body.achievedRtoHours ?? null, req.body.achievedRpoHours ?? null, req.body.summary || ''), res); },
  createEvidence(req, res, exerciseId) { wrap(repo(req).createEvidence({ ...req.body, exerciseId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listEvidence(req, res, exerciseId) { wrap(repo(req).listEvidence(exerciseId), res); },
  createGap(req, res, planId) { wrap(repo(req).createGap({ ...req.body, planId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  completeGap(req, res, id) { wrap(repo(req).completeGap(id), res); },
  acceptGapRisk(req, res, id) { wrap(repo(req).acceptGapRisk(id, req.body.reason || ''), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
