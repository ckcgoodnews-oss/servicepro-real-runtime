const { sendJson } = require('../utils/http');
function r(q) { return q.context.repositories.privacyDataTransfer; }
function t(q) { return q.body.tenantId || q.context.tenantId || ''; }
function w(value, res, status = 200) { Promise.resolve(value).then(data => sendJson(res, status, { data })).catch(e => sendJson(res, e.status || 500, { error: { code: e.code || 'error', message: e.message } })); }
module.exports = {
  createTransfer(q, res) { w(r(q).createTransfer({ ...q.body, tenantId: t(q) }), res, 201); },
  createAssessment(q, res) { w(r(q).createAssessment({ ...q.body, tenantId: t(q) }), res, 201); },
  submitAssessment(q, res, id) { w(r(q).submitAssessment(id, q.body.assessor || q.context.userId), res); },
  approveAssessment(q, res, id) { w(r(q).approveAssessment(id, q.body.reviewedBy || q.context.userId, q.body.conclusion || ''), res); },
  rejectAssessment(q, res, id) { w(r(q).rejectAssessment(id, q.body.reviewedBy || q.context.userId, q.body.reason || ''), res); },
  createSafeguard(q, res) { w(r(q).createSafeguard({ ...q.body, tenantId: t(q) }), res, 201); },
  activateSafeguard(q, res, id) { w(r(q).activateSafeguard(id), res); },
  createApproval(q, res) { w(r(q).createApproval({ ...q.body, tenantId: t(q) }), res, 201); },
  approveApproval(q, res, id) { w(r(q).approveApproval(id, q.body.comments || ''), res); },
  rejectApproval(q, res, id) { w(r(q).rejectApproval(id, q.body.comments || ''), res); },
  approveTransfer(q, res, id) { w(r(q).approveTransfer(id), res); },
  activateTransfer(q, res, id) { w(r(q).activateTransfer(id), res); },
  suspendTransfer(q, res, id) { w(r(q).suspendTransfer(id, q.body.reason || ''), res); },
  terminateTransfer(q, res, id) { w(r(q).terminateTransfer(id, q.body.reason || ''), res); },
  metrics(q, res) { w(r(q).metrics(t(q)), res); }
};
