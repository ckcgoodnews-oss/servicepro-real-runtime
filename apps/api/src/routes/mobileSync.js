const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.mobileSync; }

function filters(req) {
  return {
    userId: req.body.userId || '',
    technicianId: req.body.technicianId || '',
    status: req.body.status || '',
    deviceId: req.body.deviceId || '',
    entityType: req.body.entityType || ''
  };
}

function listDevices(req, res) {
  Promise.resolve(repo(req).listDevices(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}

function registerDevice(req, res) {
  Promise.resolve(repo(req).registerDevice(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function heartbeat(req, res, id) {
  Promise.resolve(repo(req).updateDeviceHeartbeat(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Mobile device not found' } }));
}

function getCursor(req, res, deviceId) {
  Promise.resolve(repo(req).getCursor(tenant(req), deviceId))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Sync cursor not found' } }));
}

function pushChanges(req, res) {
  Promise.resolve(repo(req).pushChanges(tenant(req), req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Mobile device not found' } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function listChanges(req, res) {
  Promise.resolve(repo(req).listChanges(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}

function resolveConflict(req, res, id) {
  Promise.resolve(repo(req).resolveConflict(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Offline change not found' } }));
}

function pullPackage(req, res) {
  Promise.resolve(repo(req).pullPackage(tenant(req), req.body))
    .then(data => sendJson(res, 200, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listDevices,
  registerDevice,
  heartbeat,
  getCursor,
  pushChanges,
  listChanges,
  resolveConflict,
  pullPackage
};
