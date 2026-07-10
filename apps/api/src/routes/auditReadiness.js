const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.auditReadiness; }
function filters(req) {
  return {
    engagementId: req.body.engagementId || '',
    status: req.body.status || '',
    severity: req.body.severity || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listEngagements(req, res) { wrap(repo(req).listEngagements(filters(req)), res); },
  createEngagement(req, res) { wrap(repo(req).createEngagement(req.body), res, 201); },
  transitionEngagement(req, res, id) { wrap(repo(req).transitionEngagement(id, req.body.status), res); },
  listRequests(req, res) { wrap(repo(req).listRequests(filters(req)), res); },
  createRequest(req, res, engagementId) { wrap(repo(req).createRequest({ ...req.body, engagementId }), res, 201); },
  submitRequest(req, res, id) { wrap(repo(req).submitRequest(id), res); },
  acceptRequest(req, res, id) { wrap(repo(req).acceptRequest(id), res); },
  rejectRequest(req, res, id) { wrap(repo(req).rejectRequest(id, req.body.reason || ''), res); },
  listEvidencePackages(req, res, requestId) { wrap(repo(req).listEvidencePackages(requestId), res); },
  createEvidencePackage(req, res, requestId) { wrap(repo(req).createEvidencePackage({ ...req.body, requestId }), res, 201); },
  markPackageReady(req, res, id) { wrap(repo(req).markPackageReady(id, req.body.preparedBy || req.context.userId || ''), res); },
  submitPackage(req, res, id) { wrap(repo(req).submitPackage(id), res); },
  listWalkthroughs(req, res, engagementId) { wrap(repo(req).listWalkthroughs(engagementId), res); },
  createWalkthrough(req, res, engagementId) { wrap(repo(req).createWalkthrough({ ...req.body, engagementId }), res, 201); },
  completeWalkthrough(req, res, id) { wrap(repo(req).completeWalkthrough(id, req.body.notes || ''), res); },
  listSampleRequests(req, res, engagementId) { wrap(repo(req).listSampleRequests(engagementId), res); },
  createSampleRequest(req, res, engagementId) { wrap(repo(req).createSampleRequest({ ...req.body, engagementId }), res, 201); },
  collectSample(req, res, id) { wrap(repo(req).collectSample(id, req.body.sampleItems || []), res); },
  submitSample(req, res, id) { wrap(repo(req).submitSample(id), res); },
  listIssues(req, res) { wrap(repo(req).listIssues(filters(req)), res); },
  createIssue(req, res, engagementId) { wrap(repo(req).createIssue({ ...req.body, engagementId }), res, 201); },
  addManagementResponse(req, res, id) { wrap(repo(req).addManagementResponse(id, req.body.response || ''), res); },
  closeIssue(req, res, id) { wrap(repo(req).closeIssue(id), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.engagementId || ''), res); }
};
