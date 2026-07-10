const { sendJson } = require('../utils/http');

function usageRepo(req) { return req.context.repositories.materialUsage; }
function inventoryRepo(req) { return req.context.repositories.inventory; }
function tenant(req) { return req.context.tenantId; }

function list(req, res) {
  Promise.resolve(usageRepo(req).list(tenant(req))).then(data => sendJson(res, 200, { data }));
}

function create(req, res) {
  Promise.resolve()
    .then(async () => {
      const item = await inventoryRepo(req).findById(tenant(req), req.body.inventoryItemId);
      if (!item) {
        const err = new Error('Inventory item not found');
        err.status = 404;
        err.code = 'not_found';
        throw err;
      }
      const usage = await usageRepo(req).create(tenant(req), {
        ...req.body,
        unitCost: req.body.unitCost ?? item.unitCost
      });
      const adjustedItem = await inventoryRepo(req).adjustQuantity(tenant(req), req.body.inventoryItemId, -Number(req.body.quantity));
      return { usage, item: adjustedItem };
    })
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

module.exports = { list, create };
