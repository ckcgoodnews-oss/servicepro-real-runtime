const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.observability; }

function filters(req) {
  return {
    serviceName: req.body.serviceName || '',
    status: req.body.status || '',
    severity: req.body.severity || '',
    monitorId: req.body.monitorId || '',
    active: req.body.active
  };
}

function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listMonitors(req, res) { wrap(repo(req).listMonitors(tenant(req), filters(req)), res); },
  createMonitor(req, res) { wrap(repo(req).createMonitor(tenant(req), req.body), res, 201); },
  listSlos(req, res) { wrap(repo(req).listSlos(tenant(req), filters(req)), res); },
  createSlo(req, res) { wrap(repo(req).createSlo(tenant(req), req.body), res, 201); },
  evaluateSlo(req, res) {
    Promise.resolve(repo(req).evaluateSlo(tenant(req), req.body))
      .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'SLO not found' } }))
      .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
  },
  listAlerts(req, res) { wrap(repo(req).listAlerts(tenant(req), filters(req)), res); },
  createAlert(req, res) { wrap(repo(req).createAlert(tenant(req), req.body), res, 201); },
  acknowledgeAlert(req, res, id) {
    Promise.resolve(repo(req).acknowledgeAlert(tenant(req), id, req.body.actor || req.context.userId || ''))
      .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Alert not found' } }))
      .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
  },
  resolveAlert(req, res, id) {
    Promise.resolve(repo(req).resolveAlert(tenant(req), id, req.body.actor || req.context.userId || ''))
      .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Alert not found' } }))
      .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
  },
  listIncidents(req, res) { wrap(repo(req).listIncidents(tenant(req), filters(req)), res); },
  createIncident(req, res) { wrap(repo(req).createIncident(tenant(req), req.body), res, 201); },
  transitionIncident(req, res, id) {
    Promise.resolve(repo(req).transitionIncident(tenant(req), id, req.body))
      .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Incident not found' } }))
      .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
  },
  addTimelineEvent(req, res, id) { wrap(repo(req).addTimelineEvent(tenant(req), { ...req.body, incidentId: id }), res, 201); },
  listTimeline(req, res, id) { wrap(repo(req).listTimeline(tenant(req), id), res); },
  summary(req, res) { wrap(repo(req).summary(tenant(req)), res); }
};
