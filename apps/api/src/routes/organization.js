const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

const repo = req => req.context.repositories.organizationUnits;
const tenant = req => operationalTenant(req);
const fail = (res, err) => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } });

function list(req, res) { Promise.resolve(repo(req).list(tenant(req))).then(data => sendJson(res, 200, { data })).catch(err => fail(res, err)); }
function create(req, res) { Promise.resolve().then(() => repo(req).create(tenant(req), req.body)).then(data => sendJson(res, 201, { data })).catch(err => fail(res, err)); }
function update(req, res, id) { Promise.resolve().then(() => repo(req).update(tenant(req), id, req.body)).then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Organization unit not found' } })).catch(err => fail(res, err)); }
function remove(req, res, id) { Promise.resolve().then(() => repo(req).delete(tenant(req), id)).then(deleted => deleted ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Organization unit not found' } })).catch(err => fail(res, err)); }

module.exports = { list, create, update, remove };
