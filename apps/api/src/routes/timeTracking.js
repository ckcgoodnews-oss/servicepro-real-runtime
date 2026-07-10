const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.timeEntries; }

function filters(req) {
  return {
    technicianId: req.body.technicianId || '',
    jobId: req.body.jobId || '',
    status: req.body.status || '',
    entryType: req.body.entryType || ''
  };
}

function list(req, res) {
  Promise.resolve(repo(req).list(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}

function get(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Time entry not found' } });
    return sendJson(res, 200, { data });
  });
}

function create(req, res) {
  Promise.resolve(repo(req).create(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function clockOut(req, res, id) {
  Promise.resolve(repo(req).clockOut(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Time entry not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function approve(req, res, id) {
  Promise.resolve(repo(req).approve(tenant(req), id, req.body.approvedBy || req.context.userId || ''))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Time entry not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function summary(req, res) {
  Promise.resolve(repo(req).laborSummary(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}

module.exports = { list, get, create, clockOut, approve, summary };
