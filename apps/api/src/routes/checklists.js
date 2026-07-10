const { sendJson } = require('../utils/http');
const { checklistCompletion } = require('../services/checklistService');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.checklists; }

function listTemplates(req, res) {
  Promise.resolve(repo(req).listTemplates(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function createTemplate(req, res) {
  Promise.resolve(repo(req).createTemplate(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listJobChecklists(req, res) {
  Promise.resolve(repo(req).listJobChecklists(tenant(req), req.body.jobId || '')).then(rows => {
    const data = rows.map(row => ({ ...row, completion: checklistCompletion(row) }));
    sendJson(res, 200, { data });
  });
}
function createFromTemplate(req, res, templateId) {
  Promise.resolve(repo(req).createFromTemplate(tenant(req), templateId, req.body))
    .then(data => data ? sendJson(res, 201, { data: { ...data, completion: checklistCompletion(data) } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Checklist template not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function updateItem(req, res, checklistId, itemCode) {
  Promise.resolve(repo(req).updateItem(tenant(req), checklistId, itemCode, req.body))
    .then(data => data ? sendJson(res, 200, { data: { ...data, completion: checklistCompletion(data) } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Checklist not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function complete(req, res, checklistId) {
  Promise.resolve(repo(req).complete(tenant(req), checklistId))
    .then(data => data ? sendJson(res, 200, { data: { ...data, completion: checklistCompletion(data) } }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Checklist not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = { listTemplates, createTemplate, listJobChecklists, createFromTemplate, updateItem, complete };
