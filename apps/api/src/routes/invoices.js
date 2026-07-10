const { sendJson } = require('../utils/http');

function repo(req) {
  return req.context.repositories.invoices;
}

function tenant(req) {
  return req.context.tenantId;
}

function list(req, res) {
  Promise.resolve(repo(req).list(tenant(req))).then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id)).then(invoice => {
    if (!invoice) return sendJson(res, 404, { error: { code: 'not_found', message: 'Invoice not found' } });
    sendJson(res, 200, { data: invoice });
  });
}

function create(req, res) {
  Promise.resolve()
    .then(() => repo(req).create(tenant(req), req.body))
    .then(invoice => sendJson(res, 201, { data: invoice }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function update(req, res, id) {
  Promise.resolve()
    .then(() => repo(req).update(tenant(req), id, req.body))
    .then(invoice => {
      if (!invoice) return sendJson(res, 404, { error: { code: 'not_found', message: 'Invoice not found' } });
      sendJson(res, 200, { data: invoice });
    })
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function remove(req, res, id) {
  Promise.resolve(repo(req).delete(tenant(req), id)).then(deleted => {
    if (!deleted) return sendJson(res, 404, { error: { code: 'not_found', message: 'Invoice not found' } });
    sendJson(res, 200, { data: { deleted: true } });
  });
}

module.exports = { list, get, create, update, remove };
