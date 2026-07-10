const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.privacy; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    status: req.body.status || '',
    requestType: req.body.requestType || '',
    subjectEmail: req.body.subjectEmail || ''
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
  verifyIdentity(req, res, id) { wrap(repo(req).verifyIdentity(id), res); },
  completeRequest(req, res, id) { wrap(repo(req).completeRequest(id), res); },
  rejectRequest(req, res, id) { wrap(repo(req).rejectRequest(id, req.body.reason || ''), res); },
  listConsents(req, res) { wrap(repo(req).listConsents(filters(req)), res); },
  createConsent(req, res) { wrap(repo(req).createConsent({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  withdrawConsent(req, res, id) { wrap(repo(req).withdrawConsent(id), res); },
  createExportJob(req, res) { wrap(repo(req).createExportJob(req.body), res, 201); },
  startExportJob(req, res, id) { wrap(repo(req).startExportJob(id), res); },
  completeExportJob(req, res, id) { wrap(repo(req).completeExportJob(id, req.body.outputUrl || ''), res); },
  createRedactionTask(req, res) { wrap(repo(req).createRedactionTask(req.body), res, 201); },
  completeRedactionTask(req, res, id) { wrap(repo(req).completeRedactionTask(id, req.body.redactedBy || req.context.userId || ''), res); },
  createErasureApproval(req, res) { wrap(repo(req).createErasureApproval(req.body), res, 201); },
  approveErasure(req, res, id) { wrap(repo(req).approveErasure(id, req.body.comments || ''), res); },
  rejectErasure(req, res, id) { wrap(repo(req).rejectErasure(id, req.body.comments || ''), res); },
  auditTrail(req, res, requestId) { wrap(repo(req).auditTrail(requestId), res); },
  summary(req, res) { wrap(repo(req).summary(req.body.tenantId || req.context.tenantId || ''), res); }
};
