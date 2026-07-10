const { sendJson } = require('../utils/http');

function repo(req) {
  return req.context.repositories.services;
}

function tenant(req) {
  return req.context.tenantId;
}

function list(req, res) {
  Promise.resolve(repo(req).list(tenant(req))).then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id)).then(service => {
    if (!service) return sendJson(res, 404, { error: { code: 'not_found', message: 'Service not found' } });
    sendJson(res, 200, { data: service });
  });
}

function create(req, res) {
  Promise.resolve()
    .then(() => repo(req).create(tenant(req), req.body))
    .then(service => sendJson(res, 201, { data: service }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function update(req, res, id) {
  Promise.resolve()
    .then(() => repo(req).update(tenant(req), id, req.body))
    .then(service => {
      if (!service) return sendJson(res, 404, { error: { code: 'not_found', message: 'Service not found' } });
      sendJson(res, 200, { data: service });
    })
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function remove(req, res, id) {
  Promise.resolve(repo(req).delete(tenant(req), id)).then(deleted => {
    if (!deleted) return sendJson(res, 404, { error: { code: 'not_found', message: 'Service not found' } });
    sendJson(res, 200, { data: { deleted: true } });
  });
}

module.exports = { list, get, create, update, remove };
