const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.aiGovernance; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    aiSystemId: req.body.aiSystemId || '',
    status: req.body.status || '',
    riskTier: req.body.riskTier || '',
    severity: req.body.severity || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listSystems(req, res) { wrap(repo(req).listSystems(filters(req)), res); },
  createSystem(req, res) { wrap(repo(req).createSystem({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  activateSystem(req, res, id) { wrap(repo(req).activateSystem(id), res); },
  pauseSystem(req, res, id) { wrap(repo(req).pauseSystem(id), res); },
  reviewSystem(req, res, id) { wrap(repo(req).reviewSystem(id), res); },
  createAssessment(req, res, aiSystemId) { wrap(repo(req).createAssessment({ ...req.body, aiSystemId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listAssessments(req, res) { wrap(repo(req).listAssessments(filters(req)), res); },
  submitAssessment(req, res, id) { wrap(repo(req).submitAssessment(id, req.body.assessor || req.context.userId || ''), res); },
  approveAssessment(req, res, id) { wrap(repo(req).approveAssessment(id), res); },
  requireMitigation(req, res, id) { wrap(repo(req).requireMitigation(id), res); },
  createApproval(req, res, assessmentId) { wrap(repo(req).createApproval({ ...req.body, assessmentId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  approveGate(req, res, id) { wrap(repo(req).approveGate(id, req.body.comments || ''), res); },
  rejectGate(req, res, id) { wrap(repo(req).rejectGate(id, req.body.comments || ''), res); },
  createSignal(req, res, aiSystemId) { wrap(repo(req).createSignal({ ...req.body, aiSystemId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listSignals(req, res, aiSystemId) { wrap(repo(req).listSignals(aiSystemId), res); },
  createIncident(req, res, aiSystemId) { wrap(repo(req).createIncident({ ...req.body, aiSystemId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listIncidents(req, res) { wrap(repo(req).listIncidents(filters(req)), res); },
  mitigateIncident(req, res, id) { wrap(repo(req).mitigateIncident(id), res); },
  closeIncident(req, res, id) { wrap(repo(req).closeIncident(id), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
