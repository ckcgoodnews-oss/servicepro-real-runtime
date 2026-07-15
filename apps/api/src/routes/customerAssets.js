const { sendJson } = require('../utils/http');
const { isWarrantyActive, assetAgeYears } = require('../services/customerAssetService');

function tenant(req) { return req.context.tenantId; }
function assets(req) { return req.context.repositories.customerAssets; }
function history(req) { return req.context.repositories.assetServiceHistory; }
function attachments(req) { return req.context.repositories.mediaAttachments; }

function enrich(asset) {
  return { ...asset, warrantyActive: isWarrantyActive(asset), ageYears: assetAgeYears(asset) };
}

function list(req, res) {
  Promise.resolve(assets(req).list(tenant(req))).then(data => sendJson(res, 200, { data: data.map(enrich) }));
}
function listForCustomer(req, res, customerId) {
  Promise.resolve(assets(req).listForCustomer(tenant(req), customerId)).then(data => sendJson(res, 200, { data: data.map(enrich) }));
}
function get(req, res, id) {
  Promise.resolve(assets(req).findById(tenant(req), id)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Customer asset not found' } });
    return sendJson(res, 200, { data: enrich(data) });
  });
}
function create(req, res) {
  Promise.resolve(assets(req).create(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data: enrich(data) }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function update(req, res, id) {
  Promise.resolve(assets(req).update(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data: enrich(data) }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Customer asset not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listHistory(req, res, id) {
  Promise.resolve(history(req).listForAsset(tenant(req), id)).then(data => sendJson(res, 200, { data }));
}
function createHistory(req, res, id) {
  Promise.resolve(assets(req).findById(tenant(req), id))
    .then(asset => {
      if (!asset) return null;
      return history(req).create(tenant(req), { ...req.body, assetId: id });
    })
    .then(data => data ? sendJson(res, 201, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Customer asset not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function listAttachments(req, res, id) {
  Promise.resolve(attachments(req).list(tenant(req), { entityType: 'asset', entityId: id })).then(data => sendJson(res, 200, { data }));
}

function createAttachment(req, res, id) {
  Promise.resolve(assets(req).findById(tenant(req), id))
    .then(asset => {
      if (!asset) return null;
      return attachments(req).create(tenant(req), { ...req.body, entityType: 'asset', entityId: id, createdBy: req.context.userId || '' });
    })
    .then(data => data ? sendJson(res, 201, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Customer asset not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = { list, listForCustomer, get, create, update, listHistory, createHistory, listAttachments, createAttachment };
