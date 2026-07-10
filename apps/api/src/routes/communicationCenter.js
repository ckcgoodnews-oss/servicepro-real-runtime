const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.communicationCenter; }

function filters(req) {
  return {
    customerId: req.body.customerId || '',
    jobId: req.body.jobId || '',
    status: req.body.status || '',
    assignedTo: req.body.assignedTo || '',
    channel: req.body.channel || ''
  };
}

function listThreads(req, res) {
  Promise.resolve(repo(req).listThreads(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}

function createThread(req, res) {
  Promise.resolve(repo(req).createThread(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function getThread(req, res, id) {
  Promise.resolve(repo(req).findThreadById(tenant(req), id)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Communication thread not found' } });
    return sendJson(res, 200, { data });
  });
}

function updateThread(req, res, id) {
  Promise.resolve(repo(req).updateThread(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Communication thread not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function listMessages(req, res, threadId) {
  Promise.resolve(repo(req).listMessages(tenant(req), threadId)).then(data => sendJson(res, 200, { data }));
}

function createMessage(req, res, threadId) {
  Promise.resolve(repo(req).createMessage(tenant(req), { ...req.body, threadId }))
    .then(data => data ? sendJson(res, 201, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Communication thread not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function assignThread(req, res, id) {
  Promise.resolve(repo(req).assignThread(tenant(req), id, req.body.assignedTo || req.context.userId || ''))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Communication thread not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function markRead(req, res, id) {
  Promise.resolve(repo(req).markRead(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Communication thread not found' } }));
}

function resolveThread(req, res, id) {
  Promise.resolve(repo(req).resolveThread(tenant(req), id))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Communication thread not found' } }));
}

function summary(req, res) {
  Promise.resolve(repo(req).summary(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}

module.exports = {
  listThreads,
  createThread,
  getThread,
  updateThread,
  listMessages,
  createMessage,
  assignThread,
  markRead,
  resolveThread,
  summary
};
