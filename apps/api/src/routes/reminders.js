const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.reminders; }

function filters(req) {
  return {
    customerId: req.body.customerId || '',
    entityType: req.body.entityType || '',
    entityId: req.body.entityId || '',
    status: req.body.status || '',
    assignedTo: req.body.assignedTo || ''
  };
}

function listRules(req, res) {
  Promise.resolve(repo(req).listRules(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function createRule(req, res) {
  Promise.resolve(repo(req).createRule(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listFollowUps(req, res) {
  Promise.resolve(repo(req).listFollowUps(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}
function timeline(req, res) {
  Promise.resolve(repo(req).timeline(tenant(req), filters(req), req.body.today)).then(data => sendJson(res, 200, { data }));
}
function getFollowUp(req, res, id) {
  Promise.resolve(repo(req).findFollowUpById(tenant(req), id)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Follow-up not found' } });
    return sendJson(res, 200, { data });
  });
}
function createFollowUp(req, res) {
  Promise.resolve(repo(req).createFollowUp(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function updateFollowUp(req, res, id) {
  Promise.resolve(repo(req).updateFollowUp(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Follow-up not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function complete(req, res, id) {
  Promise.resolve(repo(req).complete(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Follow-up not found' } }));
}
function snooze(req, res, id) {
  Promise.resolve(repo(req).snooze(tenant(req), id, req.body.snoozedUntil))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Follow-up not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function due(req, res) {
  Promise.resolve(repo(req).due(tenant(req), req.body.today || new Date().toISOString().slice(0, 10))).then(data => sendJson(res, 200, { data }));
}
function overdue(req, res) {
  Promise.resolve(repo(req).overdue(tenant(req), req.body.today || new Date().toISOString().slice(0, 10))).then(data => sendJson(res, 200, { data }));
}

module.exports = {
  listRules, createRule, listFollowUps, timeline, getFollowUp, createFollowUp,
  updateFollowUp, complete, snooze, due, overdue
};
