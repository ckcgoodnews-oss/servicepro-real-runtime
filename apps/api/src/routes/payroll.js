const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.payroll; }

function listPeriods(req, res) {
  Promise.resolve(repo(req).listPeriods(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function createPeriod(req, res) {
  Promise.resolve(repo(req).createPeriod(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listExports(req, res) {
  Promise.resolve(repo(req).listExports(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function getExport(req, res, id) {
  Promise.resolve(repo(req).findExportById(tenant(req), id)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Payroll export not found' } });
    return sendJson(res, 200, { data });
  });
}
function generateExport(req, res) {
  Promise.resolve(repo(req).generateExport(tenant(req), req.body))
    .then(data => data ? sendJson(res, 201, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Payroll period not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function approveExport(req, res, id) {
  Promise.resolve(repo(req).approveExport(tenant(req), id, req.body.approvedBy || req.context.userId || ''))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Payroll export not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function markExported(req, res, id) {
  Promise.resolve(repo(req).markExported(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Payroll export not found' } }));
}

module.exports = { listPeriods, createPeriod, listExports, getExport, generateExport, approveExport, markExported };
