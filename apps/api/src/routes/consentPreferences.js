const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.consentPreferences; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    status: req.body.status || '',
    purposeType: req.body.purposeType || '',
    email: req.body.email || '',
    subjectId: req.body.subjectId || '',
    purposeId: req.body.purposeId || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listPurposes(req, res) { wrap(repo(req).listPurposes(filters(req)), res); },
  createPurpose(req, res) { wrap(repo(req).createPurpose({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listSubjects(req, res) { wrap(repo(req).listSubjects(filters(req)), res); },
  createSubject(req, res) { wrap(repo(req).createSubject({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  suppressSubject(req, res, id) { wrap(repo(req).suppressSubject(id), res); },
  grantConsent(req, res, subjectId) { wrap(repo(req).grantConsent({ ...req.body, subjectId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listConsents(req, res) { wrap(repo(req).listConsents(filters(req)), res); },
  withdrawConsent(req, res, id) { wrap(repo(req).withdrawConsent(id, req.body.reason || '', req.body.source || 'api'), res); },
  expireConsent(req, res, id) { wrap(repo(req).expireConsent(id), res); },
  upsertPreference(req, res, subjectId) { wrap(repo(req).upsertPreference({ ...req.body, subjectId, tenantId: req.body.tenantId || req.context.tenantId || '', updatedBy: req.body.updatedBy || req.context.userId || '' }), res); },
  listPreferences(req, res) { wrap(repo(req).listPreferences(filters(req)), res); },
  auditTrail(req, res) { wrap(repo(req).auditTrail(filters(req)), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
