const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.vendorRisk; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    vendorId: req.body.vendorId || '',
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
  listVendors(req, res) { wrap(repo(req).listVendors(filters(req)), res); },
  createVendor(req, res) { wrap(repo(req).createVendor({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  activateVendor(req, res, id) { wrap(repo(req).activateVendor(id), res); },
  suspendVendor(req, res, id) { wrap(repo(req).suspendVendor(id), res); },
  createService(req, res, vendorId) { wrap(repo(req).createService({ ...req.body, vendorId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listServices(req, res, vendorId) { wrap(repo(req).listServices(vendorId), res); },
  createAssessment(req, res, vendorId) { wrap(repo(req).createAssessment({ ...req.body, vendorId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listAssessments(req, res) { wrap(repo(req).listAssessments(filters(req)), res); },
  submitAssessment(req, res, id) { wrap(repo(req).submitAssessment(id, req.body.assessor || req.context.userId || ''), res); },
  approveAssessment(req, res, id) { wrap(repo(req).approveAssessment(id), res); },
  requireRemediation(req, res, id) { wrap(repo(req).requireRemediation(id), res); },
  createAttestation(req, res, vendorId) { wrap(repo(req).createAttestation({ ...req.body, vendorId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  receiveAttestation(req, res, id) { wrap(repo(req).receiveAttestation(id, req.body.documentUrl || ''), res); },
  acceptAttestation(req, res, id) { wrap(repo(req).acceptAttestation(id, req.body.reviewedBy || req.context.userId || ''), res); },
  rejectAttestation(req, res, id) { wrap(repo(req).rejectAttestation(id, req.body.reviewedBy || req.context.userId || '', req.body.reason || ''), res); },
  createRemediation(req, res, vendorId) { wrap(repo(req).createRemediation({ ...req.body, vendorId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  completeRemediation(req, res, id) { wrap(repo(req).completeRemediation(id), res); },
  createReview(req, res, vendorId) { wrap(repo(req).createReview({ ...req.body, vendorId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  completeReview(req, res, id) { wrap(repo(req).completeReview(id, req.body.notes || ''), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
