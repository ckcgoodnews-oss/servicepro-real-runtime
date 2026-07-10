const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.vulnerabilities; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    assetType: req.body.assetType || '',
    assetId: req.body.assetId || '',
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
  listAssets(req, res) { wrap(repo(req).listAssets(filters(req)), res); },
  createAsset(req, res) { wrap(repo(req).createAsset({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listFindings(req, res) { wrap(repo(req).listFindings(filters(req)), res); },
  createFinding(req, res) { wrap(repo(req).createFinding({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  transitionFinding(req, res, id) { wrap(repo(req).transitionFinding(id, req.body.status), res); },
  createScanJob(req, res) { wrap(repo(req).createScanJob({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  startScan(req, res, id) { wrap(repo(req).startScan(id), res); },
  completeScan(req, res, id) { wrap(repo(req).completeScan(id, req.body.findingsCount || 0), res); },
  createRemediationTask(req, res, findingId) { wrap(repo(req).createRemediationTask({ ...req.body, findingId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listRemediationTasks(req, res, findingId) { wrap(repo(req).listRemediationTasks(findingId), res); },
  completeRemediationTask(req, res, id) { wrap(repo(req).completeRemediationTask(id), res); },
  createException(req, res, findingId) { wrap(repo(req).createException({ ...req.body, findingId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  approveException(req, res, id) { wrap(repo(req).approveException(id, req.body.approvedBy || req.context.userId || ''), res); },
  rejectException(req, res, id) { wrap(repo(req).rejectException(id, req.body.approvedBy || req.context.userId || ''), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
