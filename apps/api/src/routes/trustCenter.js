const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.trustCenter; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    status: req.body.status || '',
    documentType: req.body.documentType || '',
    visibility: req.body.visibility || '',
    documentId: req.body.documentId || '',
    accessRequestId: req.body.accessRequestId || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listProfiles(req, res) { wrap(repo(req).listProfiles(filters(req)), res); },
  createProfile(req, res) { wrap(repo(req).createProfile({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  publishProfile(req, res, id) { wrap(repo(req).publishProfile(id), res); },
  listDocuments(req, res) { wrap(repo(req).listDocuments(filters(req)), res); },
  createDocument(req, res) { wrap(repo(req).createDocument({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  publishDocument(req, res, id) { wrap(repo(req).publishDocument(id), res); },
  createAccessRequest(req, res, documentId) { wrap(repo(req).createAccessRequest({ ...req.body, documentId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listAccessRequests(req, res) { wrap(repo(req).listAccessRequests(filters(req)), res); },
  signNda(req, res, id) { wrap(repo(req).signNda(id), res); },
  approveAccessRequest(req, res, id) { wrap(repo(req).approveAccessRequest(id, req.body.decidedBy || req.context.userId || ''), res); },
  rejectAccessRequest(req, res, id) { wrap(repo(req).rejectAccessRequest(id, req.body.decidedBy || req.context.userId || '', req.body.reason || ''), res); },
  createShare(req, res, accessRequestId) { wrap(repo(req).createShare({ ...req.body, accessRequestId, tenantId: req.body.tenantId || req.context.tenantId || '', createdBy: req.body.createdBy || req.context.userId || '' }), res, 201); },
  listShares(req, res) { wrap(repo(req).listShares(filters(req)), res); },
  viewShare(req, res, id) { wrap(repo(req).viewShare(id), res); },
  revokeShare(req, res, id) { wrap(repo(req).revokeShare(id, req.body.revokedBy || req.context.userId || ''), res); },
  auditTrail(req, res) { wrap(repo(req).auditTrail(filters(req)), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
