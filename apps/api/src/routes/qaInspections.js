const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.qaInspections; }

function filters(req) {
  return {
    entityType: req.body.entityType || '',
    entityId: req.body.entityId || '',
    jobId: req.body.jobId || '',
    status: req.body.status || ''
  };
}

function listTemplates(req, res) {
  Promise.resolve(repo(req).listTemplates(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function createTemplate(req, res) {
  Promise.resolve(repo(req).createTemplate(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listInspections(req, res) {
  Promise.resolve(repo(req).listInspections(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}
function getInspection(req, res, id) {
  Promise.resolve(repo(req).findInspectionById(tenant(req), id)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'QA inspection not found' } });
    return sendJson(res, 200, { data });
  });
}
function createFromTemplate(req, res, templateId) {
  Promise.resolve(repo(req).createInspectionFromTemplate(tenant(req), templateId, req.body))
    .then(data => data ? sendJson(res, 201, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'QA template not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function updateItem(req, res, inspectionId, itemCode) {
  Promise.resolve(repo(req).updateItem(tenant(req), inspectionId, itemCode, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'QA inspection not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function complete(req, res, inspectionId) {
  Promise.resolve(repo(req).complete(tenant(req), inspectionId))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'QA inspection not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function score(req, res, inspectionId) {
  Promise.resolve(repo(req).score(tenant(req), inspectionId))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'QA inspection not found' } }));
}

module.exports = {
  listTemplates,
  createTemplate,
  listInspections,
  getInspection,
  createFromTemplate,
  updateItem,
  complete,
  score
};
