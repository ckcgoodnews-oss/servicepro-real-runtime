const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.controlMonitoring; }
function filters(req) {
  return {
    controlId: req.body.controlId || '',
    monitorId: req.body.monitorId || '',
    status: req.body.status || '',
    severity: req.body.severity || '',
    healthStatus: req.body.healthStatus || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listMonitors(req, res) { wrap(repo(req).listMonitors(filters(req)), res); },
  createMonitor(req, res) { wrap(repo(req).createMonitor(req.body), res, 201); },
  ingestSignal(req, res, monitorId) { wrap(repo(req).ingestSignal({ ...req.body, monitorId }), res, 201); },
  listSignals(req, res, monitorId) { wrap(repo(req).listSignals(monitorId), res); },
  evaluateMonitor(req, res, id) { wrap(repo(req).evaluateMonitor(id), res); },
  listEvaluations(req, res) { wrap(repo(req).listEvaluations(filters(req)), res); },
  listAlerts(req, res) { wrap(repo(req).listAlerts(filters(req)), res); },
  acknowledgeAlert(req, res, id) { wrap(repo(req).acknowledgeAlert(id, req.body.acknowledgedBy || req.context.userId || ''), res); },
  resolveAlert(req, res, id) { wrap(repo(req).resolveAlert(id, req.body.resolvedBy || req.context.userId || ''), res); },
  createSuppression(req, res, monitorId) { wrap(repo(req).createSuppression({ ...req.body, monitorId }), res, 201); },
  listSuppressions(req, res) { wrap(repo(req).listSuppressions(filters(req)), res); },
  revokeSuppression(req, res, id) { wrap(repo(req).revokeSuppression(id, req.body.revokedBy || req.context.userId || ''), res); },
  metrics(req, res) { wrap(repo(req).metrics(), res); }
};
