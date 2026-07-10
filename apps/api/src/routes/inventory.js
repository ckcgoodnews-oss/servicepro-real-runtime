const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.inventory; }
function adjustments(req) { return req.context.repositories.stockAdjustments; }
function tenant(req) { return req.context.tenantId; }

function list(req, res) {
  Promise.resolve(repo(req).list(tenant(req))).then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id)).then(item => {
    if (!item) return sendJson(res, 404, { error: { code: 'not_found', message: 'Inventory item not found' } });
    sendJson(res, 200, { data: item });
  });
}

function create(req, res) {
  Promise.resolve()
    .then(() => repo(req).create(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function update(req, res, id) {
  Promise.resolve()
    .then(() => repo(req).update(tenant(req), id, req.body))
    .then(data => {
      if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Inventory item not found' } });
      sendJson(res, 200, { data });
    })
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function adjust(req, res, id) {
  Promise.resolve()
    .then(async () => {
      const adjustedItem = await repo(req).adjustQuantity(tenant(req), id, req.body.quantityDelta);
      if (!adjustedItem) return null;
      const adjustment = await adjustments(req).create(tenant(req), {
        inventoryItemId: id,
        quantityDelta: req.body.quantityDelta,
        reason: req.body.reason || 'manual_adjustment',
        reference: req.body.reference || ''
      });
      return { item: adjustedItem, adjustment };
    })
    .then(data => {
      if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Inventory item not found' } });
      sendJson(res, 200, { data });
    })
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function remove(req, res, id) {
  Promise.resolve(repo(req).delete(tenant(req), id)).then(deleted => {
    if (!deleted) return sendJson(res, 404, { error: { code: 'not_found', message: 'Inventory item not found' } });
    sendJson(res, 200, { data: { deleted: true } });
  });
}

module.exports = { list, get, create, update, adjust, remove };
