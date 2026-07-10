const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.securityIncidents; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    status: req.body.status || '',
    severity: req.body.severity || '',
    incidentType: req.body.incidentType || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listIncidents(req, res) { wrap(repo(req).listIncidents(filters(req)), res); },
  createIncident(req, res) { wrap(repo(req).createIncident({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  transitionIncident(req, res, id) { wrap(repo(req).transitionIncident(id, req.body.status), res); },
  listTasks(req, res, incidentId) { wrap(repo(req).listTasks(incidentId), res); },
  createTask(req, res, incidentId) { wrap(repo(req).createTask({ ...req.body, incidentId }), res, 201); },
  completeTask(req, res, id) { wrap(repo(req).completeTask(id), res); },
  listEvidence(req, res, incidentId) { wrap(repo(req).listEvidence(incidentId), res); },
  createEvidence(req, res, incidentId) { wrap(repo(req).createEvidence({ ...req.body, incidentId }), res, 201); },
  addCustodyEntry(req, res, id) { wrap(repo(req).addCustodyEntry(id, req.body.actor || req.context.userId || '', req.body.action || ''), res); },
  listNotifications(req, res, incidentId) { wrap(repo(req).listNotifications(incidentId), res); },
  createNotification(req, res, incidentId) { wrap(repo(req).createNotification({ ...req.body, incidentId }), res, 201); },
  sendNotification(req, res, id) { wrap(repo(req).sendNotification(id), res); },
  failNotification(req, res, id) { wrap(repo(req).failNotification(id, req.body.reason || ''), res); },
  listPostmortems(req, res, incidentId) { wrap(repo(req).listPostmortems(incidentId), res); },
  createPostmortem(req, res, incidentId) { wrap(repo(req).createPostmortem({ ...req.body, incidentId }), res, 201); },
  approvePostmortem(req, res, id) { wrap(repo(req).approvePostmortem(id, req.body.approvedBy || req.context.userId || ''), res); },
  publishPostmortem(req, res, id) { wrap(repo(req).publishPostmortem(id), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
