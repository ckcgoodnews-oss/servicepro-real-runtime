const { sendJson } = require('../utils/http');
const { calculateGrossMargin, priceBookLineFromItem } = require('../services/priceBookService');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.priceBook; }

function listCategories(req, res) {
  Promise.resolve(repo(req).listCategories(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function createCategory(req, res) {
  Promise.resolve(repo(req).createCategory(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listItems(req, res) {
  Promise.resolve(repo(req).listItems(tenant(req))).then(rows => {
    const data = rows.map(item => ({ ...item, grossMarginPercent: calculateGrossMargin(item) }));
    sendJson(res, 200, { data });
  });
}
function getItem(req, res, id) {
  Promise.resolve(repo(req).findItemById(tenant(req), id)).then(item => {
    if (!item) return sendJson(res, 404, { error: { code: 'not_found', message: 'Price book item not found' } });
    sendJson(res, 200, { data: { ...item, grossMarginPercent: calculateGrossMargin(item) } });
  });
}
function createItem(req, res) {
  Promise.resolve(repo(req).createItem(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data: { ...data, grossMarginPercent: calculateGrossMargin(data) } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function updateItem(req, res, id) {
  Promise.resolve(repo(req).updateItem(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data: { ...data, grossMarginPercent: calculateGrossMargin(data) } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Price book item not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function publish(req, res) {
  Promise.resolve(repo(req).publish(tenant(req), req.body.notes || ''))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function linePreview(req, res, id) {
  Promise.resolve(repo(req).findItemById(tenant(req), id)).then(item => {
    if (!item) return sendJson(res, 404, { error: { code: 'not_found', message: 'Price book item not found' } });
    sendJson(res, 200, { data: priceBookLineFromItem(item, req.body.quantity || 1) });
  });
}

module.exports = { listCategories, createCategory, listItems, getItem, createItem, updateItem, publish, linePreview };
