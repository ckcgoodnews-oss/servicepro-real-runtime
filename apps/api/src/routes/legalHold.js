const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.legalHold; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    matterId: req.body.matterId || '',
    status: req.body.status || '',
    matterType: req.body.matterType || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listMatters(req, res) { wrap(repo(req).listMatters(filters(req)), res); },
  createMatter(req, res) { wrap(repo(req).createMatter({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  closeMatter(req, res, id) { wrap(repo(req).closeMatter(id), res); },
  createHold(req, res, matterId) { wrap(repo(req).createHold({ ...req.body, matterId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listHolds(req, res) { wrap(repo(req).listHolds(filters(req)), res); },
  issueHold(req, res, id) { wrap(repo(req).issueHold(id, req.body.issuedBy || req.context.userId || ''), res); },
  releaseHold(req, res, id) { wrap(repo(req).releaseHold(id, req.body.releasedBy || req.context.userId || ''), res); },
  createCustodian(req, res, holdId) { wrap(repo(req).createCustodian({ ...req.body, holdId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listCustodians(req, res, holdId) { wrap(repo(req).listCustodians(holdId), res); },
  acknowledgeCustodian(req, res, id) { wrap(repo(req).acknowledgeCustodian(id), res); },
  createScope(req, res, holdId) { wrap(repo(req).createScope({ ...req.body, holdId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listScopes(req, res, holdId) { wrap(repo(req).listScopes(holdId), res); },
  markScopePreserved(req, res, id) { wrap(repo(req).markScopePreserved(id), res); },
  createCollection(req, res, holdId) { wrap(repo(req).createCollection({ ...req.body, holdId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  startCollection(req, res, id) { wrap(repo(req).startCollection(id), res); },
  completeCollection(req, res, id) { wrap(repo(req).completeCollection(id, req.body.itemCount || 0, req.body.outputLocation || ''), res); },
  createExport(req, res, matterId) { wrap(repo(req).createExport({ ...req.body, matterId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  startExport(req, res, id) { wrap(repo(req).startExport(id), res); },
  completeExport(req, res, id) { wrap(repo(req).completeExport(id, req.body.outputUrl || '', req.body.itemCount || 0), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
