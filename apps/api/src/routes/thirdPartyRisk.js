const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.thirdPartyRisk; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    status: req.body.status || '',
    criticality: req.body.criticality || '',
    vendorId: req.body.vendorId || '',
    severity: req.body.severity || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listVendors(req, res) { wrap(repo(req).listVendors(filters(req)), res); },
  createVendor(req, res) { wrap(repo(req).createVendor({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  createAssessment(req, res, vendorId) { wrap(repo(req).createAssessment({ ...req.body, vendorId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listAssessments(req, res, vendorId) { wrap(repo(req).listAssessments(vendorId), res); },
  completeAssessment(req, res, id) { wrap(repo(req).completeAssessment(id), res); },
  createResponse(req, res, assessmentId) { wrap(repo(req).createResponse({ ...req.body, assessmentId }), res, 201); },
  listResponses(req, res, assessmentId) { wrap(repo(req).listResponses(assessmentId), res); },
  createFinding(req, res, vendorId) { wrap(repo(req).createFinding({ ...req.body, vendorId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listFindings(req, res) { wrap(repo(req).listFindings(filters(req)), res); },
  transitionFinding(req, res, id) { wrap(repo(req).transitionFinding(id, req.body.status), res); },
  createRemediationTask(req, res, findingId) { wrap(repo(req).createRemediationTask({ ...req.body, findingId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listRemediationTasks(req, res, findingId) { wrap(repo(req).listRemediationTasks(findingId), res); },
  completeRemediationTask(req, res, id) { wrap(repo(req).completeRemediationTask(id), res); },
  createException(req, res, findingId) { wrap(repo(req).createException({ ...req.body, findingId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  approveException(req, res, id) { wrap(repo(req).approveException(id, req.body.approvedBy || req.context.userId || ''), res); },
  rejectException(req, res, id) { wrap(repo(req).rejectException(id, req.body.approvedBy || req.context.userId || ''), res); },
  vendorRisk(req, res, vendorId) { wrap(repo(req).vendorRisk(vendorId), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
