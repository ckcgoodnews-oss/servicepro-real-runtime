const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.dataRetention; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    status: req.body.status || '',
    policyId: req.body.policyId || '',
    recordClassId: req.body.recordClassId || ''
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
  listRecordClasses(req, res) { wrap(repo(req).listRecordClasses(filters(req)), res); },
  createRecordClass(req, res) { wrap(repo(req).createRecordClass({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  createSchedule(req, res) { wrap(repo(req).createSchedule({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listSchedules(req, res) { wrap(repo(req).listSchedules(filters(req)), res); },
  markEligible(req, res, id) { wrap(repo(req).markEligible(id), res); },
  blockForLegalHold(req, res, id) { wrap(repo(req).blockForLegalHold(id, req.body.legalHoldId || ''), res); },
  unblockLegalHold(req, res, id) { wrap(repo(req).unblockLegalHold(id), res); },
  createReview(req, res, scheduleId) { wrap(repo(req).createReview({ ...req.body, scheduleId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  approveReview(req, res, id) { wrap(repo(req).approveReview(id, req.body.comments || ''), res); },
  rejectReview(req, res, id) { wrap(repo(req).rejectReview(id, req.body.comments || ''), res); },
  markDisposed(req, res, id) { wrap(repo(req).markDisposed(id), res); },
  createDeletionJob(req, res) { wrap(repo(req).createDeletionJob({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  startJob(req, res, id) { wrap(repo(req).startJob(id), res); },
  completeJob(req, res, id) { wrap(repo(req).completeJob(id, req.body.recordsProcessed || 0, req.body.recordsFailed || 0), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
