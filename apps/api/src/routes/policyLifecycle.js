const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.policyLifecycle; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    policyId: req.body.policyId || '',
    subjectId: req.body.subjectId || '',
    status: req.body.status || '',
    policyType: req.body.policyType || ''
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
  createVersion(req, res, policyId) { wrap(repo(req).createVersion({ ...req.body, policyId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listVersions(req, res, policyId) { wrap(repo(req).listVersions(policyId), res); },
  submitVersion(req, res, id) { wrap(repo(req).submitVersion(id), res); },
  approveVersion(req, res, id) { wrap(repo(req).approveVersion(id), res); },
  publishVersion(req, res, id) { wrap(repo(req).publishVersion(id), res); },
  createApproval(req, res, policyVersionId) { wrap(repo(req).createApproval({ ...req.body, policyVersionId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  approveGate(req, res, id) { wrap(repo(req).approveGate(id, req.body.comments || ''), res); },
  rejectGate(req, res, id) { wrap(repo(req).rejectGate(id, req.body.comments || ''), res); },
  createAttestation(req, res, policyId) { wrap(repo(req).createAttestation({ ...req.body, policyId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listAttestations(req, res) { wrap(repo(req).listAttestations(filters(req)), res); },
  acknowledgeAttestation(req, res, id) { wrap(repo(req).acknowledgeAttestation(id), res); },
  markOverdueAttestations(req, res) { wrap(repo(req).markOverdueAttestations(req.body.asOf || new Date().toISOString()), res); },
  createException(req, res, policyId) { wrap(repo(req).createException({ ...req.body, policyId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  approveException(req, res, id) { wrap(repo(req).approveException(id, req.body.decidedBy || req.context.userId || ''), res); },
  rejectException(req, res, id) { wrap(repo(req).rejectException(id, req.body.decidedBy || req.context.userId || ''), res); },
  createReview(req, res, policyId) { wrap(repo(req).createReview({ ...req.body, policyId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  completeReview(req, res, id) { wrap(repo(req).completeReview(id, req.body.notes || ''), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
