const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function warehouses(req) { return req.context.repositories.warehouses; }
function transfers(req) { return req.context.repositories.inventoryTransfers; }

function listWarehouses(req, res) {
  Promise.resolve(warehouses(req).list(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function createWarehouse(req, res) {
  Promise.resolve(warehouses(req).create(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function updateWarehouse(req, res, id) {
  Promise.resolve(warehouses(req).update(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Warehouse not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listBins(req, res, warehouseId = '') {
  Promise.resolve(warehouses(req).listBins(tenant(req), warehouseId)).then(data => sendJson(res, 200, { data }));
}
function createBin(req, res, warehouseId = '') {
  Promise.resolve(warehouses(req).createBin(tenant(req), { ...req.body, warehouseId: warehouseId || req.body.warehouseId }))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listTransfers(req, res) {
  Promise.resolve(transfers(req).list(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function createTransfer(req, res) {
  Promise.resolve(transfers(req).create(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function completeTransfer(req, res, id) {
  Promise.resolve(transfers(req).complete(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Transfer not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listWarehouses, createWarehouse, updateWarehouse,
  listBins, createBin,
  listTransfers, createTransfer, completeTransfer
};
