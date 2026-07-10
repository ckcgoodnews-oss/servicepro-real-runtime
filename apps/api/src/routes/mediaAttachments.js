const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.mediaAttachments; }

function list(req, res) {
  const filters = {};
  if (req.body.entityType) filters.entityType = req.body.entityType;
  if (req.body.entityId) filters.entityId = req.body.entityId;
  Promise.resolve(repo(req).list(tenant(req), filters)).then(data => sendJson(res, 200, { data }));
}

function listForEntity(req, res, entityType, entityId) {
  Promise.resolve(repo(req).list(tenant(req), { entityType, entityId })).then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Attachment not found' } });
    return sendJson(res, 200, { data });
  });
}

function create(req, res) {
  Promise.resolve(repo(req).create(tenant(req), { ...req.body, createdBy: req.context.userId || req.body.createdBy || '' }))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function createForEntity(req, res, entityType, entityId) {
  return create({ ...req, body: { ...req.body, entityType, entityId } }, res);
}

function update(req, res, id) {
  Promise.resolve(repo(req).update(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Attachment not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function remove(req, res, id) {
  Promise.resolve(repo(req).remove(tenant(req), id))
    .then(ok => ok ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Attachment not found' } }));
}

module.exports = { list, listForEntity, get, create, createForEntity, update, remove };
