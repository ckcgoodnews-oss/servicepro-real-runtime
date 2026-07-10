const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.evidenceFulfillment; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    requestId: req.body.requestId || '',
    status: req.body.status || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listBundles(req, res) { wrap(repo(req).listBundles(filters(req)), res); },
  createBundle(req, res) { wrap(repo(req).createBundle({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  markBundleReady(req, res, id) { wrap(repo(req).markBundleReady(id), res); },
  approveBundle(req, res, id) { wrap(repo(req).approveBundle(id), res); },
  createBundleItem(req, res, bundleId) { wrap(repo(req).createBundleItem({ ...req.body, bundleId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listBundleItems(req, res, bundleId) { wrap(repo(req).listBundleItems(bundleId), res); },
  createRequest(req, res) { wrap(repo(req).createRequest({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listRequests(req, res) { wrap(repo(req).listRequests(filters(req)), res); },
  approveRequest(req, res, id) { wrap(repo(req).approveRequest(id), res); },
  rejectRequest(req, res, id) { wrap(repo(req).rejectRequest(id, req.body.reason || ''), res); },
  createApproval(req, res, requestId) { wrap(repo(req).createApproval({ ...req.body, requestId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  approveDelivery(req, res, id) { wrap(repo(req).approveDelivery(id, req.body.comments || ''), res); },
  rejectDelivery(req, res, id) { wrap(repo(req).rejectDelivery(id, req.body.comments || ''), res); },
  createDeliveryLink(req, res, requestId) { wrap(repo(req).createDeliveryLink({ ...req.body, requestId, tenantId: req.body.tenantId || req.context.tenantId || '', createdBy: req.body.createdBy || req.context.userId || '' }), res, 201); },
  openDeliveryLink(req, res, id) { wrap(repo(req).openDeliveryLink(id), res); },
  deliverRequest(req, res, id) { wrap(repo(req).deliverRequest(id), res); },
  revokeDeliveryLink(req, res, id) { wrap(repo(req).revokeDeliveryLink(id, req.body.revokedBy || req.context.userId || ''), res); },
  listLinks(req, res) { wrap(repo(req).listLinks(filters(req)), res); },
  accessEvents(req, res) { wrap(repo(req).accessEvents(filters(req)), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
