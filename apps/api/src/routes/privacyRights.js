const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.privacyRights; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    status: req.body.status || '',
    requestType: req.body.requestType || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listRequests(req, res) { wrap(repo(req).listRequests(filters(req)), res); },
  createRequest(req, res) { wrap(repo(req).createRequest({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  startVerification(req, res, id) { wrap(repo(req).startVerification(id), res); },
  createVerification(req, res, requestId) { wrap(repo(req).createVerification({ ...req.body, requestId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  verifyIdentity(req, res, id) { wrap(repo(req).verifyIdentity(id), res); },
  failIdentity(req, res, id) { wrap(repo(req).failIdentity(id), res); },
  createSearchTask(req, res, requestId) { wrap(repo(req).createSearchTask({ ...req.body, requestId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listSearchTasks(req, res, requestId) { wrap(repo(req).listSearchTasks(requestId), res); },
  startSearchTask(req, res, id) { wrap(repo(req).startSearchTask(id), res); },
  completeSearchTask(req, res, id) { wrap(repo(req).completeSearchTask(id, req.body.recordsFound || 0, req.body.outputRef || ''), res); },
  createPackage(req, res, requestId) { wrap(repo(req).createPackage({ ...req.body, requestId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  markPackageReady(req, res, id) { wrap(repo(req).markPackageReady(id, req.body.packageUrl || '', req.body.preparedBy || req.context.userId || ''), res); },
  approvePackage(req, res, id) { wrap(repo(req).approvePackage(id), res); },
  createApproval(req, res, requestId) { wrap(repo(req).createApproval({ ...req.body, requestId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  approveReview(req, res, id) { wrap(repo(req).approveReview(id, req.body.comments || ''), res); },
  rejectReview(req, res, id) { wrap(repo(req).rejectReview(id, req.body.comments || ''), res); },
  createFulfillment(req, res, requestId) { wrap(repo(req).createFulfillment({ ...req.body, requestId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  sendFulfillment(req, res, id) { wrap(repo(req).sendFulfillment(id), res); },
  failFulfillment(req, res, id) { wrap(repo(req).failFulfillment(id, req.body.reason || ''), res); },
  rejectRequest(req, res, id) { wrap(repo(req).rejectRequest(id, req.body.reason || ''), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
