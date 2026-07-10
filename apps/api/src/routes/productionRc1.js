const { sendJson } = require('../utils/http');
function repo(req) { return req.context.repositories.productionRc1; }
function tenant(req) { return req.body.tenantId || req.context.tenantId || ''; }
function wrap(promise, res, status = 200) { Promise.resolve(promise).then(data => sendJson(res, status, { data })).catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } })); }
module.exports = {
  createHealthCheck(req, res) { wrap(repo(req).createHealthCheck({ ...req.body, tenantId: tenant(req) }), res, 201); },
  recordHealthResult(req, res, id) { wrap(repo(req).recordHealthResult(id, req.body.status || '', req.body.message || '', req.body.latencyMs ?? null), res); },
  createReadinessCheck(req, res) { wrap(repo(req).createReadinessCheck({ ...req.body, tenantId: tenant(req) }), res, 201); },
  markReady(req, res, id) { wrap(repo(req).markReady(id, req.body.evidenceUrl || ''), res); },
  blockReadiness(req, res, id) { wrap(repo(req).blockReadiness(id, req.body.reason || ''), res); },
  createReleaseGate(req, res) { wrap(repo(req).createReleaseGate({ ...req.body, tenantId: tenant(req) }), res, 201); },
  passGate(req, res, id) { wrap(repo(req).passGate(id, req.body.evaluatedBy || req.context.userId || '', req.body.summary || ''), res); },
  failGate(req, res, id) { wrap(repo(req).failGate(id, req.body.evaluatedBy || req.context.userId || '', req.body.summary || ''), res); },
  waiveGate(req, res, id) { wrap(repo(req).waiveGate(id, req.body.reason || '', req.body.evaluatedBy || req.context.userId || ''), res); },
  createDeployment(req, res) { wrap(repo(req).createDeployment({ ...req.body, tenantId: tenant(req) }), res, 201); },
  startDeployment(req, res, id) { wrap(repo(req).startDeployment(id), res); },
  completeDeployment(req, res, id) { wrap(repo(req).completeDeployment(id, req.body.notes || ''), res); },
  rollbackDeployment(req, res, id) { wrap(repo(req).rollbackDeployment(id, req.body.rollbackVersion || '', req.body.notes || ''), res); },
  createBackup(req, res) { wrap(repo(req).createBackup({ ...req.body, tenantId: tenant(req) }), res, 201); },
  verifyBackup(req, res, id) { wrap(repo(req).verifyBackup(id, req.body.verifiedBy || req.context.userId || '', req.body.restoreTested === true), res); },
  failBackup(req, res, id) { wrap(repo(req).failBackup(id, req.body.reason || ''), res); },
  createRunbook(req, res) { wrap(repo(req).createRunbook({ ...req.body, tenantId: tenant(req) }), res, 201); },
  activateRunbook(req, res, id) { wrap(repo(req).activateRunbook(id), res); },
  createEvidence(req, res) { wrap(repo(req).createEvidence({ ...req.body, tenantId: tenant(req) }), res, 201); },
  verifyEvidence(req, res, id) { wrap(repo(req).verifyEvidence(id, req.body.verifiedBy || req.context.userId || ''), res); },
  releaseReady(req, res) { wrap(repo(req).releaseReady(tenant(req)), res); },
  metrics(req, res) { wrap(repo(req).metrics(tenant(req)), res); }
};
