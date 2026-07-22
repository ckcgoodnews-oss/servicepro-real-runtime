const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) {
  return req.context.repositories.customers;
}

function tenant(req) {
  return operationalTenant(req);
}

function list(req, res) {
  const result = repo(req).list(tenant(req));
  Promise.resolve(result).then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id)).then(customer => {
    if (!customer) return sendJson(res, 404, { error: { code: 'not_found', message: 'Customer not found' } });
    sendJson(res, 200, { data: customer });
  });
}

function create(req, res) {
  Promise.resolve()
    .then(() => repo(req).create(tenant(req), req.body))
    .then(customer => sendJson(res, 201, { data: customer }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function update(req, res, id) {
  Promise.resolve()
    .then(() => repo(req).update(tenant(req), id, req.body))
    .then(customer => {
      if (!customer) return sendJson(res, 404, { error: { code: 'not_found', message: 'Customer not found' } });
      sendJson(res, 200, { data: customer });
    })
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function remove(req, res, id) {
  Promise.resolve(repo(req).delete(tenant(req), id)).then(deleted => {
    if (!deleted) return sendJson(res, 404, { error: { code: 'not_found', message: 'Customer not found' } });
    sendJson(res, 200, { data: { deleted: true } });
  });
}

module.exports = { list, get, create, update, remove };
