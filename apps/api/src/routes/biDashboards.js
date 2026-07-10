const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.biDashboards; }

function filters(req) {
  return {
    category: req.body.category || '',
    metricKey: req.body.metricKey || '',
    source: req.body.source || '',
    active: req.body.active
  };
}

function listDashboards(req, res) {
  Promise.resolve(repo(req).listDashboards(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}

function createDashboard(req, res) {
  Promise.resolve(repo(req).createDashboard(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function getDashboard(req, res, id) {
  Promise.resolve(repo(req).findDashboardById(tenant(req), id)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Dashboard not found' } });
    return sendJson(res, 200, { data });
  });
}

function listWidgets(req, res, dashboardId) {
  Promise.resolve(repo(req).listWidgets(tenant(req), dashboardId)).then(data => sendJson(res, 200, { data }));
}

function createWidget(req, res, dashboardId) {
  Promise.resolve(repo(req).createWidget(tenant(req), { ...req.body, dashboardId }))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function captureMetric(req, res) {
  Promise.resolve(repo(req).captureMetric(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function listMetrics(req, res) {
  Promise.resolve(repo(req).listMetricSnapshots(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}

function render(req, res, dashboardId) {
  Promise.resolve(repo(req).render(tenant(req), dashboardId))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Dashboard not found' } }));
}

function summary(req, res) {
  Promise.resolve(repo(req).summary(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}

module.exports = {
  listDashboards,
  createDashboard,
  getDashboard,
  listWidgets,
  createWidget,
  captureMetric,
  listMetrics,
  render,
  summary
};
