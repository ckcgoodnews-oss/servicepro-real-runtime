const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.privacyBreach; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    incidentId: req.body.incidentId || '',
    status: req.body.status || '',
    severity: req.body.severity || '',
    noticeType: req.body.noticeType || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listIncidents(req, res) { wrap(repo(req).listIncidents(filters(req)), res); },
  createIncident(req, res) { wrap(repo(req).createIncident({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  transitionIncident(req, res, id) { wrap(repo(req).transitionIncident(id, req.body.status), res); },
  createAssessment(req, res, incidentId) { wrap(repo(req).createAssessment({ ...req.body, incidentId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listAssessments(req, res, incidentId) { wrap(repo(req).listAssessments(incidentId), res); },
  submitAssessment(req, res, id) { wrap(repo(req).submitAssessment(id, req.body.assessor || req.context.userId || ''), res); },
  approveAssessment(req, res, id) { wrap(repo(req).approveAssessment(id), res); },
  createObligation(req, res, incidentId) { wrap(repo(req).createObligation({ ...req.body, incidentId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listObligations(req, res) { wrap(repo(req).listObligations(filters(req)), res); },
  completeObligation(req, res, id) { wrap(repo(req).completeObligation(id), res); },
  waiveObligation(req, res, id) { wrap(repo(req).waiveObligation(id, req.body.reason || ''), res); },
  markOverdue(req, res) { wrap(repo(req).markOverdue(req.body.asOf || new Date().toISOString()), res); },
  createNotice(req, res, incidentId) { wrap(repo(req).createNotice({ ...req.body, incidentId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  approveNotice(req, res, id) { wrap(repo(req).approveNotice(id, req.body.approvedBy || req.context.userId || ''), res); },
  sendNotice(req, res, id) { wrap(repo(req).sendNotice(id), res); },
  failNotice(req, res, id) { wrap(repo(req).failNotice(id, req.body.reason || ''), res); },
  createEvidence(req, res, incidentId) { wrap(repo(req).createEvidence({ ...req.body, incidentId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listEvidence(req, res, incidentId) { wrap(repo(req).listEvidence(incidentId), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
