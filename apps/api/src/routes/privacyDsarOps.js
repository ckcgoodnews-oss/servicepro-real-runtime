const { sendJson } = require('../utils/http');
function repo(req) { return req.context.repositories.privacyDsarOps; }
function tenant(req) { return req.body.tenantId || req.context.tenantId || ''; }
function wrap(promise, res, status = 200) { Promise.resolve(promise).then(data => sendJson(res, status, { data })).catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } })); }
module.exports = {
  createDsar(req, res) { wrap(repo(req).createDsar({ ...req.body, tenantId: tenant(req) }), res, 201); },
  verifyDsarIdentity(req, res, id) { wrap(repo(req).verifyDsarIdentity(id), res); },
  fulfillDsar(req, res, id) { wrap(repo(req).fulfillDsar(id, req.body.notes || ''), res); },
  denyDsar(req, res, id) { wrap(repo(req).denyDsar(id, req.body.reason || ''), res); },
  createConsent(req, res) { wrap(repo(req).createConsent({ ...req.body, tenantId: tenant(req) }), res, 201); },
  withdrawConsent(req, res, id) { wrap(repo(req).withdrawConsent(id), res); },
  createRetentionPolicy(req, res) { wrap(repo(req).createRetentionPolicy({ ...req.body, tenantId: tenant(req) }), res, 201); },
  activateRetentionPolicy(req, res, id) { wrap(repo(req).activateRetentionPolicy(id), res); },
  retireRetentionPolicy(req, res, id) { wrap(repo(req).retireRetentionPolicy(id), res); },
  createDeletionJob(req, res) { wrap(repo(req).createDeletionJob({ ...req.body, tenantId: tenant(req) }), res, 201); },
  startDeletionJob(req, res, id) { wrap(repo(req).startDeletionJob(id), res); },
  completeDeletionJob(req, res, id) { wrap(repo(req).completeDeletionJob(id, req.body.recordsDeleted || 0), res); },
  failDeletionJob(req, res, id) { wrap(repo(req).failDeletionJob(id, req.body.reason || ''), res); },
  createProcessingActivity(req, res) { wrap(repo(req).createProcessingActivity({ ...req.body, tenantId: tenant(req) }), res, 201); },
  activateProcessingActivity(req, res, id) { wrap(repo(req).activateProcessingActivity(id), res); },
  retireProcessingActivity(req, res, id) { wrap(repo(req).retireProcessingActivity(id), res); },
  createDpia(req, res) { wrap(repo(req).createDpia({ ...req.body, tenantId: tenant(req) }), res, 201); },
  submitDpiaForReview(req, res, id) { wrap(repo(req).submitDpiaForReview(id, req.body.assessor || req.context.userId || '', req.body.summary || ''), res); },
  approveDpia(req, res, id) { wrap(repo(req).approveDpia(id, req.body.reviewedBy || req.context.userId || ''), res); },
  rejectDpia(req, res, id) { wrap(repo(req).rejectDpia(id, req.body.reviewedBy || req.context.userId || '', req.body.reason || ''), res); },
  createBreach(req, res) { wrap(repo(req).createBreach({ ...req.body, tenantId: tenant(req) }), res, 201); },
  confirmBreach(req, res, id) { wrap(repo(req).confirmBreach(id), res); },
  reportBreach(req, res, id) { wrap(repo(req).reportBreach(id, req.body.regulatorReference || ''), res); },
  notifySubjects(req, res, id) { wrap(repo(req).notifySubjects(id), res); },
  closeBreach(req, res, id) { wrap(repo(req).closeBreach(id), res); },
  metrics(req, res) { wrap(repo(req).metrics(tenant(req)), res); }
};
