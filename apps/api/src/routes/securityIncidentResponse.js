const { sendJson } = require('../utils/http');
function repo(req) { return req.context.repositories.securityIncidentResponse; }
function filters(req) { return { tenantId: req.body.tenantId || req.context.tenantId || '', incidentId: req.body.incidentId || '', status: req.body.status || '', severity: req.body.severity || '', incidentType: req.body.incidentType || '' }; }
function wrap(promise, res, status = 200) { Promise.resolve(promise).then(data => sendJson(res, status, { data })).catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } })); }
module.exports = {
  listIncidents(req, res) { wrap(repo(req).listIncidents(filters(req)), res); },
  createIncident(req, res) { wrap(repo(req).createIncident({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  transitionIncident(req, res, id) { wrap(repo(req).transitionIncident(id, req.body.status || ''), res); },
  startInvestigation(req, res, id) { wrap(repo(req).startInvestigation(id, req.body.owner || req.context.userId || ''), res); },
  createTask(req, res, incidentId) { wrap(repo(req).createTask({ ...req.body, incidentId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listTasks(req, res) { wrap(repo(req).listTasks(filters(req)), res); },
  completeTask(req, res, id) { wrap(repo(req).completeTask(id), res); },
  createEvidence(req, res, incidentId) { wrap(repo(req).createEvidence({ ...req.body, incidentId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listEvidence(req, res, incidentId) { wrap(repo(req).listEvidence(incidentId), res); },
  createCommunication(req, res, incidentId) { wrap(repo(req).createCommunication({ ...req.body, incidentId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  approveCommunication(req, res, id) { wrap(repo(req).approveCommunication(id, req.body.approvedBy || req.context.userId || ''), res); },
  sendCommunication(req, res, id) { wrap(repo(req).sendCommunication(id), res); },
  createReview(req, res, incidentId) { wrap(repo(req).createReview({ ...req.body, incidentId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  completeReview(req, res, id) { wrap(repo(req).completeReview(id, req.body.rootCause || '', req.body.lessonsLearned || ''), res); },
  createAction(req, res, incidentId) { wrap(repo(req).createAction({ ...req.body, incidentId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  completeAction(req, res, id) { wrap(repo(req).completeAction(id), res); },
  acceptActionRisk(req, res, id) { wrap(repo(req).acceptActionRisk(id, req.body.reason || ''), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
