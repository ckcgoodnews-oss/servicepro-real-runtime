const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.dataResidency; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    customerId: req.body.customerId || '',
    regionCode: req.body.regionCode || '',
    status: req.body.status || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listPolicies(req, res) { wrap(repo(req).listPolicies(filters(req)), res); },
  createPolicy(req, res) { wrap(repo(req).createPolicy({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listAssignments(req, res) { wrap(repo(req).listAssignments(filters(req)), res); },
  createAssignment(req, res) { wrap(repo(req).createAssignment({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  createTransferReview(req, res) { wrap(repo(req).createTransferReview({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listTransferReviews(req, res) { wrap(repo(req).listTransferReviews(filters(req)), res); },
  evaluateTransfer(req, res, id) { wrap(repo(req).evaluateTransfer(id), res); },
  approveTransfer(req, res, id) { wrap(repo(req).approveTransfer(id, req.body.reviewedBy || req.context.userId || ''), res); },
  rejectTransfer(req, res, id) { wrap(repo(req).rejectTransfer(id, req.body.reviewedBy || req.context.userId || '', req.body.reason || ''), res); },
  completeTransfer(req, res, id) { wrap(repo(req).completeTransfer(id), res); },
  createRequirement(req, res) { wrap(repo(req).createRequirement({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listRequirements(req, res) { wrap(repo(req).listRequirements(filters(req)), res); },
  satisfyRequirement(req, res, id) { wrap(repo(req).satisfyRequirement(id), res); },
  createViolation(req, res) { wrap(repo(req).createViolation({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listViolations(req, res) { wrap(repo(req).listViolations(filters(req)), res); },
  remediateViolation(req, res, id) { wrap(repo(req).remediateViolation(id), res); },
  closeViolation(req, res, id) { wrap(repo(req).closeViolation(id), res); },
  createApproval(req, res, transferReviewId) { wrap(repo(req).createApproval({ ...req.body, transferReviewId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  approveReviewApproval(req, res, id) { wrap(repo(req).approveReviewApproval(id, req.body.comments || ''), res); },
  rejectReviewApproval(req, res, id) { wrap(repo(req).rejectReviewApproval(id, req.body.comments || ''), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
