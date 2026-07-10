const { sendJson } = require('../utils/http');
function repo(req) { return req.context.repositories.governanceReporting; }
function filters(req) { return { tenantId: req.body.tenantId || req.context.tenantId || '', status: req.body.status || '', domain: req.body.domain || '' }; }
function wrap(promise, res, status = 200) { Promise.resolve(promise).then(data => sendJson(res, status, { data })).catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } })); }
module.exports = {
  createKpi(req, res) { wrap(repo(req).createKpi({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listKpis(req, res) { wrap(repo(req).listKpis(filters(req)), res); },
  activateKpi(req, res, id) { wrap(repo(req).activateKpi(id), res); },
  createDashboard(req, res) { wrap(repo(req).createDashboard({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  publishDashboard(req, res, id) { wrap(repo(req).publishDashboard(id), res); },
  createWidget(req, res, dashboardId) { wrap(repo(req).createWidget({ ...req.body, dashboardId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listWidgets(req, res, dashboardId) { wrap(repo(req).listWidgets(dashboardId), res); },
  createReportTemplate(req, res) { wrap(repo(req).createReportTemplate({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  activateReportTemplate(req, res, id) { wrap(repo(req).activateReportTemplate(id), res); },
  createSnapshot(req, res) { wrap(repo(req).createSnapshot({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  generateSnapshot(req, res, id) { wrap(repo(req).generateSnapshot(id, req.body.data || {}, req.body.summary || '', req.body.generatedBy || req.context.userId || ''), res); },
  failSnapshot(req, res, id) { wrap(repo(req).failSnapshot(id, req.body.reason || ''), res); },
  createDelivery(req, res) { wrap(repo(req).createDelivery({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  sendDelivery(req, res, id) { wrap(repo(req).sendDelivery(id), res); },
  failDelivery(req, res, id) { wrap(repo(req).failDelivery(id, req.body.reason || ''), res); },
  createExport(req, res) { wrap(repo(req).createExport({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  startExport(req, res, id) { wrap(repo(req).startExport(id), res); },
  completeExport(req, res, id) { wrap(repo(req).completeExport(id, req.body.fileUrl || ''), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
