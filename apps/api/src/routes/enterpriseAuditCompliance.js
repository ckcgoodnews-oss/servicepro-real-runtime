const { sendJson } = require('../utils/http');
function repo(req) { return req.context.repositories.enterpriseAuditCompliance; }
function tenant(req) { return req.body.tenantId || req.context.tenantId || ''; }
function wrap(promise, res, status = 200) { Promise.resolve(promise).then(data => sendJson(res, status, { data })).catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } })); }
module.exports = {
  createProgram(req, res) { wrap(repo(req).createProgram({ ...req.body, tenantId: tenant(req) }), res, 201); },
  activateProgram(req, res, id) { wrap(repo(req).activateProgram(id), res); },
  closeProgram(req, res, id) { wrap(repo(req).closeProgram(id), res); },
  createControl(req, res) { wrap(repo(req).createControl({ ...req.body, tenantId: tenant(req) }), res, 201); },
  activateControl(req, res, id) { wrap(repo(req).activateControl(id), res); },
  retireControl(req, res, id) { wrap(repo(req).retireControl(id), res); },
  createEvidenceRequest(req, res) { wrap(repo(req).createEvidenceRequest({ ...req.body, tenantId: tenant(req) }), res, 201); },
  submitEvidenceRequest(req, res, id) { wrap(repo(req).submitEvidenceRequest(id), res); },
  acceptEvidenceRequest(req, res, id) { wrap(repo(req).acceptEvidenceRequest(id), res); },
  rejectEvidenceRequest(req, res, id) { wrap(repo(req).rejectEvidenceRequest(id, req.body.reason || ''), res); },
  createArtifact(req, res) { wrap(repo(req).createArtifact({ ...req.body, tenantId: tenant(req) }), res, 201); },
  acceptArtifact(req, res, id) { wrap(repo(req).acceptArtifact(id, req.body.reviewedBy || req.context.userId || ''), res); },
  rejectArtifact(req, res, id) { wrap(repo(req).rejectArtifact(id, req.body.reviewedBy || req.context.userId || '', req.body.reason || ''), res); },
  createControlTest(req, res) { wrap(repo(req).createControlTest({ ...req.body, tenantId: tenant(req) }), res, 201); },
  startControlTest(req, res, id) { wrap(repo(req).startControlTest(id, req.body.tester || req.context.userId || ''), res); },
  completeControlTest(req, res, id) { wrap(repo(req).completeControlTest(id, req.body.exceptionsFound || 0, req.body.summary || ''), res); },
  createFinding(req, res) { wrap(repo(req).createFinding({ ...req.body, tenantId: tenant(req) }), res, 201); },
  remediateFinding(req, res, id) { wrap(repo(req).remediateFinding(id), res); },
  closeFinding(req, res, id) { wrap(repo(req).closeFinding(id), res); },
  acceptFindingRisk(req, res, id) { wrap(repo(req).acceptFindingRisk(id, req.body.reason || ''), res); },
  createRemediation(req, res) { wrap(repo(req).createRemediation({ ...req.body, tenantId: tenant(req) }), res, 201); },
  startRemediation(req, res, id) { wrap(repo(req).startRemediation(id), res); },
  completeRemediation(req, res, id) { wrap(repo(req).completeRemediation(id), res); },
  createAttestation(req, res) { wrap(repo(req).createAttestation({ ...req.body, tenantId: tenant(req) }), res, 201); },
  submitAttestation(req, res, id) { wrap(repo(req).submitAttestation(id), res); },
  acceptAttestation(req, res, id) { wrap(repo(req).acceptAttestation(id), res); },
  auditReady(req, res) { wrap(repo(req).auditReady(tenant(req)), res); },
  metrics(req, res) { wrap(repo(req).metrics(tenant(req)), res); }
};
