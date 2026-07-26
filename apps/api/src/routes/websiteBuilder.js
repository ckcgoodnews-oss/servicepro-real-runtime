const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');

function repo(req) { return req.context.repositories.websiteBuilder; }
function tenant(req) { return operationalTenant(req); }

function listPages(req, res) {
  Promise.resolve(repo(req).listPages(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function getPage(req, res, id) {
  Promise.resolve(repo(req).findPageById(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Page not found' } }));
}

function createPage(req, res) {
  Promise.resolve(repo(req).createPage(tenant(req), { ...req.body, createdBy: req.context.userId || '' }))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function updatePage(req, res, id) {
  Promise.resolve(repo(req).updatePage(tenant(req), id, req.body || {}))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Page not found' } }));
}

function deletePage(req, res, id) {
  Promise.resolve(repo(req).deletePage(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Page not found' } }));
}

function publishPage(req, res, id) {
  Promise.resolve(repo(req).publishPage(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Page not found' } }));
}

function getTheme(req, res) {
  Promise.resolve(repo(req).getTheme(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function updateTheme(req, res) {
  Promise.resolve(repo(req).updateTheme(tenant(req), req.body || {}))
    .then(data => sendJson(res, 200, { data }));
}

function listMedia(req, res) {
  Promise.resolve(repo(req).listMedia(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function addMedia(req, res) {
  if (!req.body?.filename || !req.body?.url) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'filename and url are required' } });
  }
  Promise.resolve(repo(req).addMedia(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }));
}

function deleteMedia(req, res, id) {
  Promise.resolve(repo(req).deleteMedia(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data: { deleted: true } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Media not found' } }));
}

function getSectionTemplates(req, res) {
  sendJson(res, 200, { data: repo(req).getSectionTemplates() });
}

module.exports = { listPages, getPage, createPage, updatePage, deletePage, publishPage, getTheme, updateTheme, listMedia, addMedia, deleteMedia, getSectionTemplates };
