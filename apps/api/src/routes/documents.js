const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.documents; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    status: req.body.status || '',
    documentType: req.body.documentType || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listTemplates(req, res) { wrap(repo(req).listTemplates(filters(req)), res); },
  createTemplate(req, res) { wrap(repo(req).createTemplate(req.body), res, 201); },
  listPackets(req, res) { wrap(repo(req).listPackets(filters(req)), res); },
  createPacket(req, res) { wrap(repo(req).createPacket({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  generatePacket(req, res, id) { wrap(repo(req).generatePacket(id), res); },
  listApprovals(req, res, packetId) { wrap(repo(req).listApprovals(packetId), res); },
  createApproval(req, res, packetId) { wrap(repo(req).createApproval({ ...req.body, packetId }), res, 201); },
  approve(req, res, id) { wrap(repo(req).approve(id, req.body.comments || ''), res); },
  reject(req, res, id) { wrap(repo(req).reject(id, req.body.comments || ''), res); },
  createSignatureRequest(req, res, packetId) { wrap(repo(req).createSignatureRequest({ ...req.body, packetId }), res, 201); },
  sendSignatureRequest(req, res, id) { wrap(repo(req).sendSignatureRequest(id), res); },
  listRecipients(req, res, signatureRequestId) { wrap(repo(req).listRecipients(signatureRequestId), res); },
  createRecipient(req, res, signatureRequestId) { wrap(repo(req).createRecipient({ ...req.body, signatureRequestId }), res, 201); },
  signRecipient(req, res, id) { wrap(repo(req).signRecipient(id), res); },
  declineRecipient(req, res, id) { wrap(repo(req).declineRecipient(id), res); },
  auditTrail(req, res, packetId) { wrap(repo(req).auditTrail(packetId), res); }
};
