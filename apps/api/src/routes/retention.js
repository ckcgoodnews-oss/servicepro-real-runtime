const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.retention; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    status: req.body.status || '',
    documentType: req.body.documentType || '',
    classificationLevel: req.body.classificationLevel || '',
    documentId: req.body.documentId || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listPolicies(req, res) { wrap(repo(req).listPolicies(filters(req)), res); },
  createPolicy(req, res) { wrap(repo(req).createPolicy(req.body), res, 201); },
  listClassifications(req, res) { wrap(repo(req).listClassifications(filters(req)), res); },
  classifyDocument(req, res) { wrap(repo(req).classifyDocument({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listLegalHolds(req, res) { wrap(repo(req).listLegalHolds(filters(req)), res); },
  placeLegalHold(req, res) { wrap(repo(req).placeLegalHold({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  releaseLegalHold(req, res, id) { wrap(repo(req).releaseLegalHold(id, req.body.releasedBy || req.context.userId || ''), res); },
  queueReview(req, res) { wrap(repo(req).queueReview({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listReviews(req, res) { wrap(repo(req).listReviews(filters(req)), res); },
  approveReview(req, res, id) { wrap(repo(req).approveReview(id, req.body.reviewedBy || req.context.userId || ''), res); },
  rejectReview(req, res, id) { wrap(repo(req).rejectReview(id, req.body.reviewedBy || req.context.userId || '', req.body.reason || ''), res); },
  markDeleted(req, res, id) { wrap(repo(req).markDeleted(id), res); },
  createExportJob(req, res) { wrap(repo(req).createExportJob({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  startExportJob(req, res, id) { wrap(repo(req).startExportJob(id), res); },
  completeExportJob(req, res, id) { wrap(repo(req).completeExportJob(id, req.body.outputUrl || ''), res); },
  summary(req, res) { wrap(repo(req).summary(req.body.tenantId || req.context.tenantId || ''), res); }
};
