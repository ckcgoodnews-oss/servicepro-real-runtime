const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');
const tenant = req => operationalTenant(req);
const articles = req => req.context.repositories.knowledgeArticles;
const attachments = req => req.context.repositories.mediaAttachments;
const fail = (res, error) => sendJson(res, error.status || 500, { error: { code: error.code || 'error', message: error.message, details: error.details || {} } });
function list(req, res) { Promise.resolve(articles(req).list(tenant(req))).then(data => sendJson(res, 200, { data })).catch(error => fail(res, error)); }
function get(req, res, id) { Promise.resolve(articles(req).findById(tenant(req), id)).then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Knowledge article not found' } })).catch(error => fail(res, error)); }
function create(req, res) { Promise.resolve(articles(req).create(tenant(req), req.body)).then(data => sendJson(res, 201, { data })).catch(error => fail(res, error)); }
function update(req, res, id) { Promise.resolve(articles(req).update(tenant(req), id, req.body)).then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Knowledge article not found' } })).catch(error => fail(res, error)); }
function listAttachments(req, res, id) { Promise.resolve(articles(req).findById(tenant(req), id)).then(article => article ? attachments(req).list(tenant(req), { entityType: 'knowledge', entityId: id }) : null).then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Knowledge article not found' } })).catch(error => fail(res, error)); }
function createAttachment(req, res, id) { Promise.resolve(articles(req).findById(tenant(req), id)).then(article => article ? attachments(req).create(tenant(req), { ...req.body, entityType: 'knowledge', entityId: id, createdBy: req.context.userId || '' }) : null).then(data => data ? sendJson(res, 201, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Knowledge article not found' } })).catch(error => fail(res, error)); }
module.exports = { list, get, create, update, listAttachments, createAttachment };
