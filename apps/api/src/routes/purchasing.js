const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }

function vendors(req) { return req.context.repositories.vendors; }
function purchaseOrders(req) { return req.context.repositories.purchaseOrders; }

function listVendors(req, res) {
  Promise.resolve(vendors(req).list(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function createVendor(req, res) {
  Promise.resolve(vendors(req).create(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function getVendor(req, res, id) {
  Promise.resolve(vendors(req).findById(tenant(req), id)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Vendor not found' } });
    return sendJson(res, 200, { data });
  });
}
function updateVendor(req, res, id) {
  Promise.resolve(vendors(req).update(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Vendor not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function listPurchaseOrders(req, res) {
  Promise.resolve(purchaseOrders(req).list(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function createPurchaseOrder(req, res) {
  Promise.resolve(purchaseOrders(req).create(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function getPurchaseOrder(req, res, id) {
  Promise.resolve(purchaseOrders(req).findById(tenant(req), id)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Purchase order not found' } });
    return sendJson(res, 200, { data });
  });
}
function updatePurchaseOrder(req, res, id) {
  Promise.resolve(purchaseOrders(req).update(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Purchase order not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function receivePurchaseOrder(req, res, id) {
  Promise.resolve(purchaseOrders(req).receive(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 201, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Purchase order not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function receipts(req, res, id) {
  Promise.resolve(purchaseOrders(req).receipts(tenant(req), id)).then(data => sendJson(res, 200, { data }));
}

module.exports = {
  listVendors, createVendor, getVendor, updateVendor,
  listPurchaseOrders, createPurchaseOrder, getPurchaseOrder, updatePurchaseOrder,
  receivePurchaseOrder, receipts
};
