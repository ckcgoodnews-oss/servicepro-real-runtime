const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.assetConfigCompliance; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    assetId: req.body.assetId || '',
    status: req.body.status || '',
    assetType: req.body.assetType || '',
    criticality: req.body.criticality || '',
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
  activateAsset(req, res, id) { wrap(repo(req).activateAsset(id), res); },
  quarantineAsset(req, res, id) { wrap(repo(req).quarantineAsset(id), res); },
  createBaseline(req, res) { wrap(repo(req).createBaseline({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  activateBaseline(req, res, id) { wrap(repo(req).activateBaseline(id), res); },
  createRule(req, res, baselineId) { wrap(repo(req).createRule({ ...req.body, baselineId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listRules(req, res, baselineId) { wrap(repo(req).listRules(baselineId), res); },
  createScan(req, res) { wrap(repo(req).createScan({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  startScan(req, res, id) { wrap(repo(req).startScan(id), res); },
  runScan(req, res, id) { wrap(repo(req).runScan(id), res); },
  listFindings(req, res) { wrap(repo(req).listFindings(filters(req)), res); },
  resolveFinding(req, res, id) { wrap(repo(req).resolveFinding(id), res); },
  acceptFindingRisk(req, res, id) { wrap(repo(req).acceptFindingRisk(id, req.body.reason || ''), res); },
  createRemediation(req, res, findingId) { wrap(repo(req).createRemediation({ ...req.body, findingId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  completeRemediation(req, res, id) { wrap(repo(req).completeRemediation(id), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
